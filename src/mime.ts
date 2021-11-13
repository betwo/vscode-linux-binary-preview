import * as vscode from 'vscode';
import { getCommandOutput } from './utils/command';

export type MimeType = string;

export async function getMimeType(uri: vscode.Uri): Promise<string | undefined> {
    let config = vscode.workspace.getConfiguration('vscode-linux-binary-preview');
    let file_executable = config['file_command'];
    let args = ['-L', '-b', '--mime-type', uri.fsPath.toString()];

    console.log(`${file_executable} ${args.join(' ')}`);
    try {
        let output = await getCommandOutput(file_executable, args)
        console.log(output);
        return output[0];

    } catch (exception) {
        console.error(exception);
        if (exception.signal === undefined) {
            vscode.window.showErrorMessage(`Cannot run 'file' via command '${file_executable}'. Please install it or set the option 'vscode-linux-binary-preview.file_command'.`);
        }
        return undefined;
    }
}