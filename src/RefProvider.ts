'use strict';

/*
 0 Find this C symbol:
 1 Find this function definition:
 2 Find functions called by this function:
 3 Find functions calling this function:
 4 Find this text string:
 5 Change this text string:
 6 Find this egrep pattern:
 7 Find this file:
 8 Find files #including this file:
*/

import * as vscode from 'vscode';
const spawnSync = require('child_process').spawnSync;

export class RefProvider implements vscode.ReferenceProvider {
    public provideReferences(
        document: vscode.TextDocument, position: vscode.Position,
        options: { includeDeclaration: boolean }, token: vscode.CancellationToken):
        Thenable<vscode.Location[]> {
            const symbol = document.getText(document.getWordRangeAtPosition(position));

            return new Promise<vscode.Location[]>((resolve, reject) => {

                const cscopeExecConfig = {
                    cwd: vscode.workspace.rootPath + '/.vscode/cscope',
                    env: process.env};
                let ret = spawnSync("cscope", ['-L0' + symbol], cscopeExecConfig);
                const fileList = ret.stdout.toString().split('\n');

                let list = [];
                fileList.forEach((line) =>{
                    const contents = line.split(' ');
                    if (contents.length > 3)
                    {
                        let fileName = contents[0];
                        console.log(fileName);
                        const lineNum = parseInt(contents[2]) - 1;
                        let start_pos = new vscode.Position(lineNum, 0);
                        let end_pos = new vscode.Position(lineNum, 0);
                        let loc = new vscode.Location(vscode.Uri.file(fileName), new vscode.Range(start_pos, end_pos));
                        list.push(loc);
                    }
                });

                return resolve(list);
        });
    }
}