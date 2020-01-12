import * as vscode from 'vscode';
import * as fs from 'fs';

import { SharedObjectContentProvider } from './content_provider_so';

const so_provider = new SharedObjectContentProvider();

export async function openTextDocument(document: vscode.TextDocument, context: vscode.ExtensionContext) {
  if (document === undefined) {
    if (vscode.window.activeTextEditor !== undefined) {
      document = vscode.window.activeTextEditor.document;
    }
  }
  if (document === undefined) {
    vscode.window.showWarningMessage("Cannot show binary information, no document is opened.");
    return;
  }
  if (document.languageId === 'shared_object' || document.languageId === 'archive') {
    openBinaryFilePreview(document.uri, context);
  } else {
    try {
      fs.accessSync(document.uri.fsPath, fs.constants.X_OK);
      openBinaryFilePreview(document.uri, context);
    } catch (err) {
      // binary is not executable, do nothing
    }
  }
}

export async function openBinaryFilePreview(uri: vscode.Uri, context: vscode.ExtensionContext) {
  let panel = vscode.window.createWebviewPanel(
    'binary viewer',
    uri.fsPath.toString(),
    vscode.ViewColumn.Active,
    {
      enableScripts: true,
      enableFindWidget: true
    }
  );

  panel.webview.onDidReceiveMessage(
    message => {
      switch (message.command) {
        case 'showBinary':
          openBinaryFilePreview(vscode.Uri.parse(message.text), context);
          return;
      }
    },
    undefined,
    context.subscriptions
  );

  panel.webview.html = await so_provider.toHTML(uri);
}

export function activate(context: vscode.ExtensionContext) {
  const openCommand = vscode.commands.registerCommand(
    'linux-binary-preview.openCurrentFile', (thisArg: any, ...args: any[]) => {
      openTextDocument(args[0], context);
    });

  const openEvent = vscode.workspace.onDidOpenTextDocument(
    (document: vscode.TextDocument) => {
      openTextDocument(document, context);
    });

  for (let document of vscode.workspace.textDocuments) {
    openTextDocument(document, context);
  }

  context.subscriptions.push(openCommand, openEvent);
}

export function deactivate() { }
