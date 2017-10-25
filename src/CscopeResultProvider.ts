'use strict';

import * as vscode from 'vscode';

export default class CscopeResultProvider implements vscode.TextDocumentContentProvider{

	static scheme = 'references';

	private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
	private _subscriptions: vscode.Disposable;

	constructor() {
	}

	dispose() {
		this._subscriptions.dispose();
		this._onDidChange.dispose();
	}

	// Expose an event to signal changes of _virtual_ documents
	// to the editor
	get onDidChange() {
		return this._onDidChange.event;
	}

	// Provider method that takes an uri of the `references`-scheme and
	// resolves its content by (1) running the reference search command
	// and (2) formatting the results
	provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {
			return 'adfasdfasdfsdf';
	}

}

export function decodeLocation(uri: vscode.Uri): [vscode.Uri, vscode.Position] {
	let [target, line, character] = <[string, number, number]>JSON.parse(uri.query);
	return [vscode.Uri.parse(target), new vscode.Position(line, character)];
}


let seq = 0;

export function encodeLocation(uri: vscode.Uri, pos: vscode.Position): vscode.Uri {
	const query = JSON.stringify([uri.toString(), pos.line, pos.character]);
	return vscode.Uri.parse(`${CscopeResultProvider.scheme}:References.locations?${query}#${seq++}`);
}