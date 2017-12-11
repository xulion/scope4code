'use strict';

import * as vscode from 'vscode';
import CscopeExecutor from './CscopeExecutor';

export default class SearchResultProvider implements 
            vscode.TextDocumentContentProvider, vscode.DocumentLinkProvider{
    executor:CscopeExecutor = null;
    
    constructor (executor : CscopeExecutor){
        this.executor = executor;
    }

    dispose() {
    }
    
    static scheme = "search";

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string>{
        const [briefText, symbol, functionIndex] = <[string, string, number]>JSON.parse(uri.query);
        const briefing = `${briefText} "${symbol}":\n`;

        const fileList = this.executor.execCommand(symbol, functionIndex);
        let content = '';
        fileList.forEach((line) =>{
            content += line.fileName + ':' + line.lineNum + '\n';
        });
    
        return briefing + content;
    }

    provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]>{
        return null;        
    }
    
}

export function openSearch(brief:string, functionIndex:number, columnMode : boolean){
    if (vscode.window){
        if (vscode.window.activeTextEditor){
            const position = vscode.window.activeTextEditor.selection.active;
            const document = vscode.window.activeTextEditor.document;
            const symbol = document.getText(document.getWordRangeAtPosition(position));
            const query = JSON.stringify([brief, symbol, functionIndex]); //Find functions called by this function
            let docUri = vscode.Uri.parse(`${SearchResultProvider.scheme}:${symbol}.find ?${query}`);
            let viewColumn = vscode.window.activeTextEditor.viewColumn;
            if (columnMode)
            {
                viewColumn += 1;
            }
            return vscode.workspace.openTextDocument(docUri).then((doc) => {
                vscode.window.showTextDocument(doc.uri, {viewColumn:viewColumn, preserveFocus:false, preview:false});
            });
        }
    }
}