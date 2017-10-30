'use strict';

import * as vscode from 'vscode';
const spawnSync = require('child_process').spawnSync;

const SYMBOL_UNKNOWN = 0;
const SYMBOL_FUNCTION = 1;
const SYMBOL_DATATYPE = 2;
const SYMBOL_CLASS = 3;

export class DefinitionProvider implements vscode.DefinitionProvider {	
	public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition> {

        const symbol = document.getText(document.getWordRangeAtPosition(position));
        
        return new Promise<vscode.Location[]>((resolve, reject) => {
        
                const cscopeExecConfig = {
                    cwd: vscode.workspace.rootPath + '/.vscode/cscope',
                    env: process.env};
                let ret = spawnSync("cscope", ['-L0' + symbol], cscopeExecConfig);
                        const fileList = ret.stdout.toString().split('\n');
        
                        let list = [];
                        let filteredResult = [];
                        let currentSymbolLevel = SYMBOL_UNKNOWN;
                        fileList.forEach((line) =>{
                            const contents = line.split(' ');
                            if ((contents.length > 3) && (contents[1] === '<global>'))
                            {
                                console.log(line);
                                const reClass = new RegExp('class\\s*' + symbol + '\\s*[^A-Za-z0-9_;]');
                                const reStruct = new RegExp('struct\\s*' + symbol + '\\s*[^A-Za-z0-9_;]');
                                const reEnum = new RegExp('enum\\s*' + symbol + '\\s*[^A-Za-z0-9_;]');
                                const reFunction = new RegExp('::\\s*' + symbol + '.*[^;]');
                                if ((line.search(reClass) !== -1) ||
                                    (line.search(reStruct) !== -1) ||
                                    (line.search(reEnum) !== -1))
                                {
                                    if (currentSymbolLevel <= SYMBOL_CLASS)
                                    {
                                        if (currentSymbolLevel < SYMBOL_CLASS)
                                        {
                                            filteredResult.length = 0;
                                        }
                                        currentSymbolLevel = SYMBOL_CLASS;
                                        filteredResult.push(line);
                                        console.log(line);
                                    }
                                }
                                else if (line.search(reClass) !== -1)
                                {
                                    if (currentSymbolLevel <= SYMBOL_FUNCTION)
                                    {
                                        if (currentSymbolLevel < SYMBOL_FUNCTION)
                                        {
                                            filteredResult.length = 0;
                                        }
                                        currentSymbolLevel = SYMBOL_FUNCTION;
                                        filteredResult.push(line);
                                    }
                                }
                                else if (currentSymbolLevel === 0)
                                {
                                    filteredResult.push(line);
                                }

                            }
                        });
                            
                        filteredResult.forEach((symbolText)=>{
                            const contents = symbolText.split(' ');
                            
                            let fileName = contents[0];
                            console.log(fileName);
                            const lineNum = parseInt(contents[2]) - 1;
                            let start_pos = new vscode.Position(lineNum, 0);
                            let end_pos = new vscode.Position(lineNum, 0);
                            let loc = new vscode.Location(vscode.Uri.file(fileName), new vscode.Range(start_pos, end_pos));
                            list.push(loc);

                        })
        
                        return resolve(list);
                });
    }
}