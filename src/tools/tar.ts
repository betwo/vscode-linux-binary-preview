import * as vscode from 'vscode';
import { Tool } from "../tool"
import { getCommandOutput } from '../utils/command';

export class Tar implements Tool {
    getName(): string {
        return "tar";
    }
    async getOutput(uri: vscode.Uri): Promise<string> {
        let config = vscode.workspace.getConfiguration('vscode-linux-binary-preview');
        let executable = config['tar_command'];
        let args = ['-tf', uri.fsPath.toString()];

        try {
            const zip_output = await getCommandOutput(executable, args);
            const parsed_output = zip_output.map((s) => {
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

        } catch (exception) {
            console.error(exception);
            if (exception.signal === undefined) {
                const error_msg = `Cannot run 'tar' via command '${executable}'. Please install it or set the option 'vscode-linux-binary-preview.tar_command'.`;
                return `<p><span style='color: red; font-weight: bold'>Error: ${error_msg}</span></p>`;
            }
            return undefined;
        }
    }
}