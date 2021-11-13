import * as vscode from 'vscode';
import { Tool } from "../tool"
import { getCommandOutput } from '../utils/command';

export class File implements Tool {
    getName(): string {
        return "file";
    }
    async getOutput(uri: vscode.Uri): Promise<string> {
        let config = vscode.workspace.getConfiguration('vscode-linux-binary-preview');
        let file_executable = config['file_command'];
        let args = [uri.fsPath.toString(), '-L'];

        try {
            let file = await getCommandOutput(file_executable, args);
            return `<h2>${file}</h2>`;

        } catch (exception) {
            console.error(exception);
            if (exception.signal === undefined) {
                const error_msg = `Cannot run 'file' via command '${file_executable}'. Please install it or set the option 'vscode-linux-binary-preview.file_command'.`;
                return `<p><span style='color: red; font-weight: bold'>Error: ${error_msg}</span></p>`;
            }
            return undefined;
        }
    }
}