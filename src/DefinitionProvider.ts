'use strict';

import * as vscode from 'vscode';
const spawnSync = require('child_process').spawnSync;

import CscopeExecutor from './CscopeExecutor';
import SymbolLocation from './SymbolLocation';

var path = require('path');

const SYMBOL_UNKNOWN = 0;
const SYMBOL_FUNCTION = 1;
const SYMBOL_DATATYPE = 2;
const SYMBOL_CLASS = 3;

export class DefinitionProvider implements vscode.DefinitionProvider {	
    executor:CscopeExecutor = null;
    
    constructor (executor : CscopeExecutor){
        this.executor = executor;
    }

    public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition> {

        const symbol = document.getText(document.getWordRangeAtPosition(position));
        
        return new Promise<vscode.Location[]>(async (resolve, reject) => {
                    
            const fileList = await this.executor.findDefinition(symbol);
            let list = [];
            fileList.forEach((line) =>{
                let fileName = line.fileName;
                if (!path.isAbsolute(fileName))
                fileName = path.join(vscode.workspace.rootPath, fileName);
//                console.log(fileName);
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