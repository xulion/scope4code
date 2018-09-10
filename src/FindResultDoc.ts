'use strict';

import * as vscode from 'vscode';
import CscopeExecutor from './CscopeExecutor';

export default class FindResultDoc {
    private links: vscode.DocumentLink[];
    private docContent : string;
    private docUri : string;

    constructor (uri: vscode.Uri, executor:CscopeExecutor){
        const [briefText, symbol, functionIndex] = <[string, string, number]>JSON.parse(uri.query);
        const briefing = `${briefText} "${symbol}":\n`;
        this.docUri = uri.toString();
        const fileList = executor.execCommand(symbol, functionIndex);
        let content = '';
        let lineNum = 1;
        const workspacePathLen = vscode.workspace.rootPath.length;
        this.links = [];
        fileList.forEach((line) =>{
//            const fileInfo = line.fileName.slice(workspacePathLen) + ':' + line.lineNum
            const fileInfo = line.fileName + ':' + line.lineNum;
            content += fileInfo + ` ${line.otherText}\n`;
            const linkRange = new vscode.Range(lineNum, 0, lineNum, fileInfo.length);
            const linkTarget = vscode.Uri.parse(`file:${line.fileName}#${line.lineNum}`);
            const docLink = new vscode.DocumentLink(linkRange, linkTarget);
            this.links.push(docLink);
            lineNum++;
        });

        this.docContent = briefing + content;
    }

    getDocContent():string{
        return this.docContent;
    }

    getUri() :string{
        return this.docUri;
    }

    getDocLinks():vscode.ProviderResult<vscode.DocumentLink[]>{
        return this.links;
    }
}