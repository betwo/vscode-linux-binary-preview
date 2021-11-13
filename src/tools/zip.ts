import * as vscode from 'vscode';
import { Tool } from "../tool"
import { getCommandOutput } from '../utils/command';

export class Zip extends Tool {
    constructor() {
        super("zip");
    }

    async getOutput(uri: vscode.Uri): Promise<string> {
        let config = vscode.workspace.getConfiguration('vscode-linux-binary-preview');
        let executable = config['zip_command'];
        let args = ['-sf', uri.fsPath.toString()];

        const zip_output = await getCommandOutput(executable, args);
        const filtered_output = zip_output.slice(1, zip_output.length - 2);
        const parsed_output = filtered_output.map((s) => {
            const path = s.endsWith("/") ? s.slice(0, s.length - 1) : s;
            const segments = path.split("/");
            return segments;
        })
        let content = "<p>Archive contents:</p>";
        for (const segments of parsed_output) {
            for (let i = 0; i < segments.length; ++i) {
                const segment = segments[i];
                if (i === (segments.length - 1)) {
                    content += `<span style="font-weight: bold">${segment}</span>`;
                } else {
                    content += `<span>${segment} / </span>`;
                }
            }
            content += '<br />';
        }
        return content;
    }
}