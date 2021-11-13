import * as vscode from 'vscode';

export interface Tool {
    getName(): string;
    getOutput(uri: vscode.Uri): Promise<string>;
}