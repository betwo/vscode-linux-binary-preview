import * as vscode from 'vscode';
import { Tool } from "../tool"
import { getCommandOutput } from '../utils/command';

export class File extends Tool {
    constructor() {
        super("file");
    }

    async getOutput(uri: vscode.Uri): Promise<string> {
        let config = vscode.workspace.getConfiguration('vscode-linux-binary-preview');
        let file_executable = config['file_command'];
        let args = [uri.fsPath.toString(), '-L'];

        let file = await getCommandOutput(file_executable, args);
        return `<h2>${file}</h2>`;
    }
}