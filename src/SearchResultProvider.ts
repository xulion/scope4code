'use strict';

import * as vscode from 'vscode';
import CscopeExecutor from './CscopeExecutor';
import FindResultDoc from './FindResultDoc';

export default class SearchResultProvider implements 
            vscode.TextDocumentContentProvider, vscode.DocumentLinkProvider{
    private executor:CscopeExecutor = null;
    private docs: FindResultDoc[];
    
    constructor (executor : CscopeExecutor){
        this.executor = executor;
        this.docs = [];
    }

    dispose() {
        this.docs.length = 0;
    }
    
    static scheme = "search";

    private getDoc(uri: vscode.Uri) : FindResultDoc{
        let resultDoc = null;

        for (let i = 0; i < this.docs.length; ++i){
            if (this.docs[i].getUri() === uri.toString()) {
                resultDoc = this.docs[i];
                break;
            }
        }

        if (!resultDoc){
            resultDoc = new FindResultDoc(uri, this.executor);
            this.docs.push(resultDoc);
        }
        
        return resultDoc;
    }

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string>{

        const resultDoc = this.getDoc(uri);
        return resultDoc.getDocContent();
    }

    provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]>{
        const resultDoc = this.getDoc(document.uri);
        return resultDoc.getDocLinks();
    }
    
}

export function openSearch(brief:string, functionIndex:number, columnMode : boolean){
    if (vscode.window){
        if (vscode.window.activeTextEditor){

            const position = vscode.window.activeTextEditor.selection.active;
            const document = vscode.window.activeTextEditor.document;
            const symbol = document.getText(document.getWordRangeAtPosition(position));

            vscode.window.showInputBox({ value: symbol, prompt: "Enter the text", 
                                        placeHolder: "", password: false }).then( (info) => {
                if (info !== undefined && info.length > 0) {
                    vscode.window.setStatusBarMessage(info);
                    const query = JSON.stringify([brief, info, functionIndex]);
                    let docUri = vscode.Uri.parse(`${SearchResultProvider.scheme}:${info}.find ?${query}`);
                    let viewColumn = vscode.window.activeTextEditor.viewColumn;
                    if (columnMode)
                    {
                        viewColumn += 1;
                    }
                    return vscode.workspace.openTextDocument(docUri).then((doc) => {
                        vscode.window.showTextDocument(doc.uri, {viewColumn:viewColumn, preserveFocus:false, preview:false});
                    });

                } else {
                    vscode.window.setStatusBarMessage("no text provided");
                }
            });

        }
    }
}