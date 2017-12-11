'use strict';

import * as vscode from 'vscode';

import CscopeExecutor from './CscopeExecutor';
import SymbolLocation from './SymbolLocation';

export class RefProvider implements vscode.ReferenceProvider {

    executor:CscopeExecutor = null;

    constructor (executor : CscopeExecutor){
        this.executor = executor;
    }

    public provideReferences(
        document: vscode.TextDocument, position: vscode.Position,
        options: { includeDeclaration: boolean }, token: vscode.CancellationToken):
        Thenable<vscode.Location[]> {
            const symbol = document.getText(document.getWordRangeAtPosition(position));

            return new Promise<vscode.Location[]>((resolve, reject) => {

                const fileList = this.executor.findReferences(symbol);
                let list = [];
                fileList.forEach((line) =>{
                    let fileName = line.fileName;
                    console.log(fileName);
                    const lineNum = line.lineNum - 1;
                    let start_pos = new vscode.Position(lineNum, line.colStart);
                    let end_pos = new vscode.Position(lineNum, line.colEnd);
                    let loc = new vscode.Location(vscode.Uri.file(fileName), new vscode.Range(start_pos, end_pos));
                    list.push(loc);
                    });

                return resolve(list);
        });
    }
}