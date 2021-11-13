import * as vscode from 'vscode';
import { BinaryFile } from './binary_file';
import { getMimeType, MimeType } from './mime';

import { ToolManager } from './tool_manager';

export class SharedObjectContentProvider implements vscode.CustomReadonlyEditorProvider<BinaryFile>  {

    private static readonly viewType = 'linuxBinaryPreview.preview';
    private static readonly viewTypeForecd = 'linuxBinaryPreview.forcePreview';

    public static register(context: vscode.ExtensionContext): vscode.Disposable[] {
        const provider = new SharedObjectContentProvider(context);
        const options = { webviewOptions: { enableFindWidget: true } };
        const providerRegistrations = [
            vscode.window.registerCustomEditorProvider(SharedObjectContentProvider.viewType, provider, options),
            vscode.window.registerCustomEditorProvider(SharedObjectContentProvider.viewTypeForecd, provider, options)
        ];
        return providerRegistrations;
    }

    tools = new ToolManager();

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    public onDidChangeCustomDocument: vscode.Event<vscode.CustomDocumentEditEvent<BinaryFile>> | vscode.Event<vscode.CustomDocumentContentChangeEvent<BinaryFile>>;

    public async openCustomDocument(uri: any, openContext: any, token: any): Promise<BinaryFile> {
        return await BinaryFile.create(uri, openContext);
    }

    public async resolveCustomEditor(
        document: any,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
        };

        webviewPanel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'showBinary':
                        vscode.commands.executeCommand('vscode.openWith', vscode.Uri.parse(message.text), SharedObjectContentProvider.viewType);
                        return;
                    default:
                        console.log(`Unsupported message: ${message}`);
                        return;
                }
            }
        );

        webviewPanel.webview.html = await this.toHTML(document.uri);
    }

    public async toHTML(uri: vscode.Uri): Promise<string | undefined> {
        const mime_type: MimeType = await getMimeType(uri);
        const tools = this.tools.getToolsForMimeType(mime_type);

        let content = "";
        content += "<h1>" + uri.fsPath.toString() + "</h1>";
        content += "<p></p>";
        content += `<h2>MIME:</h2><p>${mime_type}</p>`;

        for (let tool of tools) {
            try {
                content += `<h2>${tool.getName()}:</h2>`;
                content += await tool.getOutput(uri);
            } catch (err) {
                const error_msg = `Cannot run '${tool.constructor.name}': ${err}`;
                content += `<p><span style='color: red; font-weight: bold'>Error: ${error_msg}</span></p>`;
            }
        }

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
}