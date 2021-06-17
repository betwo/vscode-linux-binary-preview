import * as vscode from "vscode";

export class BinaryFile implements vscode.CustomDocument {
    static async create(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext): Promise<BinaryFile | PromiseLike<BinaryFile>> {
        return new BinaryFile(uri);
    }

    private readonly uri_: vscode.Uri;

    private constructor(
        uri: vscode.Uri,
    ) {
        this.uri_ = uri;
    }
    public get uri(): vscode.Uri { return this.uri_; }
    dispose(): void {}
}
