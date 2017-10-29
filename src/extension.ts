'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const spawnSync = require('child_process').spawnSync;
const fs = require('fs');
import {RefProvider} from './RefProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "codescope" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposableBuild = vscode.commands.registerCommand('extension.build', () => {
        buildDataBase();
    });
 
    context.subscriptions.push(
        vscode.languages.registerReferenceProvider(
            "cpp", new RefProvider()));
}


function findText()
{

}

function buildDataBase()
{
    // start with linux command line since this is easier. Later shall change
    // to node api for file search.
    // Now we are building the database
    vscode.window.showInformationMessage('Building cscope database!');
    const execConfig = {
        cwd: vscode.workspace.rootPath,
        env: process.env};
    let ret = spawnSync("mkdir", ['-p', '.vscode'], execConfig);
    spawnSync("mkdir", ['-p', '.vscode/cscope'], execConfig);
    ret = spawnSync("find", [vscode.workspace.rootPath, '-type', 'f', '-name', '*.c', 
                       '-o', '-name', '*.h', 
                       '-o', '-name', '*.cpp', 
                       '-o', '-name', '*.cc', 
                       '-o', '-name', '*.mm'], execConfig);
    if (ret.stderr.length > 0)
    {
        console.log(ret.stderr.toString());
    }
    else{
        fs.writeFileSync(vscode.workspace.rootPath + '/.vscode/cscope/cscope.files', ret.stdout.toString());
        const cscopeExecConfig = {
            cwd: vscode.workspace.rootPath + '/.vscode/cscope',
            env: process.env};
        ret = spawnSync("cscope", ['-b', '-q', '-k'], cscopeExecConfig);                
    }

    vscode.window.showInformationMessage('Building finished!');
}

// this method is called when your extension is deactivated
export function deactivate() {
}