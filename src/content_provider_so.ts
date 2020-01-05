import * as vscode from 'vscode';
import * as child_process from 'child_process';

export class SharedObjectContentProvider {
    public async toHTML(uri: vscode.Uri): Promise<string | undefined> {
        let content = "";
        content += "<h1>" + uri.toString() + "</h1>";
        content += "<p></p>";

        content += await this.getFileOutput(uri);

        try {
            content += await this.getLddOutput(uri);
        } catch (err) {
            // not a shared object
        }

        content += await this.getNmOutput(uri);

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Binary Viewer</title>
            </head>
            <body>
            ${content}
            <script>
                openResource = function (vscode, uri) {
                    vscode.postMessage({
                        command: 'showBinary',
                        text: uri 
                    });
                };
                (function() {
                    const vscode = acquireVsCodeApi();
                    const links = document.getElementsByTagName('a');
                    for (let i = 0; i < links.length; i++) {
                        const link = links[i];
                        link.onclick = function() { openResource(vscode, link.href); };
                    }
                }())
                </script>
            </body>
        </html>`;
    }

    private async getFileOutput(uri: vscode.Uri): Promise<string | undefined> {
        let config = vscode.workspace.getConfiguration('vscode-linux-binary-preview');
        let file_executable = config['file_command'];
        let args = [uri.fsPath.toString()];

        let file = await this.getCommandOutput(`${file_executable} ${args.join(' ')}`);
        return `<h2>${file}</h2>`;
    }

    private async getLddOutput(uri: vscode.Uri): Promise<string | undefined> {
        let content = "<h2>ldd:</h2>";
        content += "<table>";
        content += `<tr><th>Symbol</th><th>Library</th></tr>`;

        let config = vscode.workspace.getConfiguration('vscode-linux-binary-preview');
        let ldd_executable = config['ldd_command'];
        let args = [uri.fsPath.toString()];

        let ldd = await this.getCommandOutput(`${ldd_executable} ${args.join(' ')}`);

        for (let row of ldd) {
            let [symbol, library] = row.split(/\s*=>\s*/);
            symbol.trim();

            if (library !== undefined) {
                library.trim();
                let info = library.match(/(.*)\s*\((.*)\)/);
                if (info) {
                    let file = info[1];
                    let offset = info[2];
                    content += `<tr><td>${symbol}</td><td><a href='file://${file}'>${file}</a> (${offset})</td></tr>`;
                } else {
                    content += `<tr><td>${symbol}</td><td>${library}</td></tr>`;
                }
            } else {
                content += `<tr><td>${symbol}</td><td><i>undefined</i></td></tr>`;
            }
        }
        content += "</table>";
        return content;
    }

    private async getNmOutput(uri: vscode.Uri): Promise<string | undefined> {
        let config = vscode.workspace.getConfiguration('vscode-linux-binary-preview');
        let nm_executable = config['nm_command'];
        let args = [uri.fsPath.toString()];

        let nm = await this.getCommandOutput(`${nm_executable} --demangle ${args.join(' ')}`);

        let content = "<h2>nm:</h2>";
        content += "<table>";
        content += `<tr><th>Symbol</th><th>Type</th><th>Offset</th></tr>`;

        let nm_rows: string[][] = [];
        for (let row of nm) {
            let info = row.match(/(.{16}) (.) (.*)/);
            if (info) {
                let offset = info[1];
                let type = info[2].trim();
                let symbol = info[3];
                nm_rows.push([symbol, offset, type]);
            }
        }

        nm_rows.sort(([symbol_a, offset_a, type_a], [symbol_b, offset_b, type_b]) => {
            if (symbol_a.toLowerCase() < symbol_b.toLowerCase()) { return -1; }
            if (symbol_a.toLowerCase() > symbol_b.toLowerCase()) { return 1; }
            return 0;
        });

        for (let nm_row of nm_rows) {
            let [symbol, offset, type] = nm_row;

            let formatted_symbol = symbol;
            let formatted_type = type;

            let description: string;
            switch (type) {
                case "A":
                    description = "The symbol's value is absolute, and will not be changed by further linking.";
                    break;
                case "B":
                case "b":
                    description = "The symbol is in the BSS data section.  This section typically contains zero-initialized or uninitialized data, although the exact behavior is system dependent.";
                    break;
                case "C":
                    description = "The symbol is common.  Common symbols are uninitialized data.  When linking, multiple common symbols may appear with the same name.If the symbol is defined anywhere, the common symbols are treated as undefined references.";
                    break;
                case "D":
                case "d":
                    description = "The symbol is in the initialized data section.";
                    break;
                case "G":
                case "g":
                    description = "The symbol is in an initialized data section for small objects.  Some object file formats permit more efficient access to small data objects, such as a global int variable as opposed to a large global array.";
                    break;
                case "i":
                    description = "For PE format files this indicates that the symbol is in a section specific to the implementation of DLLs.  For ELF format files this indicates that the symbol is an indirect function.This is a GNU extension to the standard set of ELF symbol types.It indicates a symbol which if referenced by a relocation does not evaluate to its address, but instead must be invoked at runtime.The runtime execution will then return the value to be used in the relocation.";
                    break;
                case "I":
                    description = "The symbol is an indirect reference to another symbol.";
                    break;
                case "N":
                    description = "The symbol is a debugging symbol.";
                    formatted_symbol = `<span style='color: grey'>${formatted_symbol}</span>`;
                    break;
                case "p":
                    description = "The symbols is in a stack unwind section.";
                    break;
                case "R":
                case "r":
                    description = "The symbol is in a read only data section.";
                    break;
                case "S":
                case "s":
                    description = "The symbol is in an uninitialized or zero-initialized data section for small objects.";
                    break;
                case "T":
                case "t":
                    description = "The symbol is in the text (code) section.";
                    break;
                case "U":
                    description = "The symbol is undefined.";
                    formatted_symbol = `<span style='color: red; font-weight: bold'>${formatted_symbol}</span>`;
                    formatted_type = `<span style='color: red; font-weight: bold'>${formatted_type}</span>`;
                    break;
                case "u":
                    description = "The symbol is a unique global symbol.  This is a GNU extension to the standard set of ELF symbol bindings.  For such a symbol the dynamic linker will make sure that in the entire process there is just one symbol with this name and type in use.";
                    break;
                case "V":
                case "v":
                    description = "The symbol is a weak object.  When a weak defined symbol is linked with a normal defined symbol, the normal defined symbol is used with no error.When a weak undefined symbol is linked and the symbol is not defined, the value of the weak symbol becomes zero with no error.On some systems, uppercase indicates that a default value has been specified.";
                    break;
                case "W":
                case "w":
                    description = "The symbol is a weak symbol that has not been specifically tagged as a weak object symbol.  When a weak defined symbol is linked with a normal defined symbol, the normal defined symbol is used with no error.When a weak undefined symbol is linked and the symbol is not defined, the value of the symbol is determined in a system - specific manner without error.On some systems, uppercase indicates that a default value has been specified.";
                    break;
                case "-":
                    description = "The symbol is a stabs symbol in an a.out object file.  In this case, the next values printed are the stabs other field, the stabs desc field, and the stab type.Stabs symbols are used to hold debugging information.";
                    break;
                case "?":
                    description = "The symbol type is unknown, or object file format specific.";
                    formatted_symbol = `<span style='color: red; font-weight: bold'>${formatted_symbol}</span>`;
                    break;

            }

            content += `<tr><td>${formatted_symbol}</td><td><span title='${description}'>${formatted_type}</span></td><td>${offset}</td></tr>`;
        }

        content += "</table>";

        return content;
    }

    private async getCommandOutput(command: string): Promise<string[] | undefined> {
        let options: child_process.ExecOptionsWithStringEncoding = {
            encoding: 'utf8',
            maxBuffer: 1024 * 1024 * 1024
        };

        return new Promise(
            (resolve, reject) => {
                let child = child_process.exec(command, options,
                    (err, std_out, std_err) => {
                        if (err) {
                            console.log(`error: ${err}\n${std_err}`);
                            vscode.window.showErrorMessage(err.message);
                            reject();
                            return;
                        }

                        resolve(std_out.split(/\n/));
                    });
            });
    }
}