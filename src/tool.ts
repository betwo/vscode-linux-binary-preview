import * as vscode from 'vscode';
import { CommandError } from './utils/command';

export abstract class Tool {
    constructor(protected name: string) {
    }

    async getFormattedOutput(uri: vscode.Uri): Promise<string> {
        try {
            return await this.getOutput(uri);
        } catch (exception) {
            if (exception.exec.signal === undefined) {
                const error_msg = `Cannot run '${this.name}' via command '${exception.command}'. Please install it or set the option 'vscode-linux-binary-preview.${this.name}_command'.`;
                return `<p><span style='color: red; font-weight: bold'>Error: ${error_msg}</span></p>`;
            }
            return undefined;
        }
    }

    getName(): string {
        return this.name;
    }

    abstract getOutput(uri: vscode.Uri): Promise<string>;
}