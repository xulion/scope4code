'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const spawnSync = require('child_process').spawnSync;
const fs = require('fs');
import {RefProvider} from './RefProvider';
import {DefinitionProvider} from './DefinitionProvider';

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

    context.subscriptions.push(vscode.languages.registerReferenceProvider(["cpp", "c"], new RefProvider()));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(['cpp', 'c'], new DefinitionProvider()));
    
}

const defaultConfig = 
'{\n' +
'    "version": "0.0.1",\n' +
'    "configurations": [\n' +
'        {\n' + 
'            "cscope" : {\n' + 
'                "paths" : [\n' + 
'                    "${workspaceRoot}"\n' + 
'                ]\n' + 
'            }\n' +
'        }\n' +
'    ]\n' +
'}';

function loadConfiguration():string
{
    const fileName = vscode.workspace.rootPath + '/.vscode/cscope_conf.json';
    try{
        fs.accessSync(fileName, fs.constants.R_OK);
    }
    catch{
        console.log("file does not exist");
        fs.writeFileSync(fileName, defaultConfig);
    }

    const configText = fs.readFileSync(fileName).toString();
    return configText;
}

function buildDataBase()
{
    const configurations = JSON.parse(loadConfiguration());
    const sourcePaths = configurations.configurations[0].cscope.paths;

    // start with linux command line since this is easier. Later shall change
    // to node api for file search.
    // Now we are building the database
    vscode.window.showInformationMessage('Building cscope database!');

    let start = true;

    sourcePaths.forEach((path) => {
        const fullPath = path.replace("${workspaceRoot}", vscode.workspace.rootPath);
        const execConfig = {
            cwd: vscode.workspace.rootPath,
            env: process.env};

        let ret = spawnSync("mkdir", ['-p', '.vscode'], execConfig);
        spawnSync("mkdir", ['-p', '.vscode/cscope'], execConfig);
        ret = spawnSync("find", [fullPath, '-type', 'f', '-name', '*.c', 
                           '-o', '-type', 'f', '-name', '*.h', 
                           '-o', '-type', 'f', '-name', '*.cpp', 
                           '-o', '-type', 'f', '-name', '*.cc', 
                           '-o', '-type', 'f', '-name', '*.mm'], execConfig);
        if (ret.stderr.length > 0)
        {
            console.log(ret.stderr.toString());
        }
        else{
            if (start){
                fs.writeFileSync(vscode.workspace.rootPath + '/.vscode/cscope/cscope.files', ret.stdout.toString());
            }
            else{
                fs.appendFileSync(vscode.workspace.rootPath + '/.vscode/cscope/cscope.files', ret.stdout.toString());
            }
            start = false;
        }
    });

    const cscopeExecConfig = {
        cwd: vscode.workspace.rootPath + '/.vscode/cscope',
        env: process.env};
    const ret = spawnSync("cscope", ['-b', '-q', '-k'], cscopeExecConfig);
    vscode.window.showInformationMessage('Building finished!');
}

// this method is called when your extension is deactivated
export function deactivate() {
}