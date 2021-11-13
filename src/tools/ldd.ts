import * as vscode from 'vscode';
import { Tool } from "../tool"
import { getCommandOutput } from '../utils/command';

export class Ldd implements Tool {
    getName(): string {
        return "ldd";
    }
    async getOutput(uri: vscode.Uri): Promise<string> {
        let content: string;
        content = "<table>";
        content += `<tr><th>Symbol</th><th>Library</th></tr>`;

        let config = vscode.workspace.getConfiguration('vscode-linux-binary-preview');
        let ldd_executable = config['ldd_command'];
        let args = [uri.fsPath.toString()];

        let ldd: String[] = [];
        try {
            ldd = await getCommandOutput(ldd_executable, args);
        } catch (exception) {
            console.error(exception);
            if (exception.signal === undefined) {
                const error_msg = `Cannot run 'ldd' via command '${ldd_executable}'. Please install it or set the option 'vscode-linux-binary-preview.ldd_command'.`;
                return `<p><span style='color: red; font-weight: bold'>Error: ${error_msg}</span></p>`;
            }
        }

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
}