import * as vscode from 'vscode';
import { Tool } from "../tool"
import { getCommandOutput } from '../utils/command';

export class SevenZip implements Tool {
    segment_lengths: number[];

    constructor() {
        const header_marker = "------------------- ----- ------------ ------------- ------------------------";
        const segments = header_marker.split(" ");
        this.segment_lengths = segments.map((s) => s.length);
    }

    getName(): string {
        return "7z";
    }
    async getOutput(uri: vscode.Uri): Promise<string> {
        let config = vscode.workspace.getConfiguration('vscode-linux-binary-preview');
        let executable = config['7z_command'];
        let args = ['l', uri.fsPath.toString()];

        try {
            const output = await getCommandOutput(executable, args);
            const first_row = output.findIndex((row) => row.indexOf("   Date      Time") >= 0);
            const filtered_output = output.slice(first_row);
            const parsed_output = filtered_output.map((line) => {
                let segments = [];
                let start = 0;
                let index = 0;
                for (const segment_length of this.segment_lengths) {
                    let end = undefined;
                    if (index != this.segment_lengths.length - 1) {
                        end = start + segment_length;
                    }
                    segments.push(line.substring(start, end));
                    start += end - start + 1;
                    index++;
                }
                return segments;
            })
            let content = "<p>Archive contents:</p>";
            content += "<table>";
            for (const segments of parsed_output) {
                content += '<tr>';
                for (let i = 0; i < segments.length; ++i) {
                    const segment = segments[i];
                    if (i === (segments.length - 1)) {
                        content += `<td style="font-weight: bold">${segment}</td>`;
                    } else {
                        content += `<td>${segment} </td>`;
                    }
                }
                content += '</tr>';
            }
            content += "</table>";
            return content;

        } catch (exception) {
            console.error(exception);
            if (exception.signal === undefined) {
                const error_msg = `Cannot run '7z' via command '${executable}'. Please install it or set the option 'vscode-linux-binary-preview.7z_command'.`;
                return `<p><span style='color: red; font-weight: bold'>Error: ${error_msg}</span></p>`;
            }
            return undefined;
        }
    }
}