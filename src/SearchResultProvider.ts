'use strict';

import * as vscode from 'vscode';
import CscopeExecutor from './CscopeExecutor';

export default class SearchResultProvider implements 
            vscode.TextDocumentContentProvider, vscode.DocumentLinkProvider{
    private executor:CscopeExecutor = null;
    private links: vscode.DocumentLink[];
    
    constructor (executor : CscopeExecutor){
        this.executor = executor;
        this.links = [];
    }

    dispose() {
    }
    
    static scheme = "search";

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string>{
        const [briefText, symbol, functionIndex] = <[string, string, number]>JSON.parse(uri.query);
        const briefing = `${briefText} "${symbol}":\n`;

        const fileList = this.executor.execCommand(symbol, functionIndex);
        let content = '';
        let lineNum = 1;
        const workspacePathLen = vscode.workspace.rootPath.length;
        fileList.forEach((line) =>{
            const fileInfo = line.fileName.slice(workspacePathLen) + ':' + line.lineNum
            content += fileInfo + ` ${line.otherText}\n`;
            const linkRange = new vscode.Range(lineNum, 0, lineNum, fileInfo.length);
            const linkTarget = vscode.Uri.parse(`file:/${line.fileName}#${line.lineNum}`);
            const docLink = new vscode.DocumentLink(linkRange, linkTarget);
            this.links.push(docLink);
            lineNum++;
        });
    
        return briefing + content;
    }

    provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]>{
        return this.links;        
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