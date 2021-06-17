import * as vscode from 'vscode';

import { SharedObjectContentProvider } from './content_provider_so';

export function activate(context: vscode.ExtensionContext) {
  for(const sub of SharedObjectContentProvider.register(context)) {
    context.subscriptions.push(sub);
  }
}

export function deactivate() { }
