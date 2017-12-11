'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const spawnSync = require('child_process').spawnSync;
const fs = require('fs');
import {RefProvider} from './RefProvider';
import {DefinitionProvider} from './DefinitionProvider';
import CscopeExecutor from './CscopeExecutor';
import SearchResultProvider, {openSearch} from './SearchResultProvider';

let configurations = null;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    configurations = JSON.parse(loadConfiguration());
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "codescope" is now active!');

    const executor = new CscopeExecutor(null, vscode.workspace.rootPath + '/.vscode');
    const searchResult = new SearchResultProvider(executor);

	const providerRegistrations = vscode.Disposable.from(
		vscode.workspace.registerTextDocumentContentProvider(SearchResultProvider.scheme, searchResult),
		vscode.languages.registerDocumentLinkProvider({ scheme: SearchResultProvider.scheme }, searchResult)
    );
    
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    const disposableBuild = vscode.commands.registerCommand('extension.build', () => {
        buildDataBase();
    });
    
    const findSymbolCmd = vscode.commands.registerCommand('extension.findSymbol', () => {
        findSymbol();
    });

    const findDefinitionCmd = vscode.commands.registerCommand('extension.findDefinition', () => {
        findDefinition();
    });

    const findCalleeCmd = vscode.commands.registerCommand('extension.findCallee', () => {
        findCallee();
    });

    const findCallerCmd = vscode.commands.registerCommand('extension.findCaller', () => {
        findCaller();
    });

    const findTextCmd = vscode.commands.registerCommand('extension.findText', () => {
        findText();
    });

    const findIncludeCmd = vscode.commands.registerCommand('extension.findInclude', () => {
        findInclude();
    });

    context.subscriptions.push(vscode.languages.registerReferenceProvider(["cpp", "c"], new RefProvider(executor)));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(['cpp', 'c'], new DefinitionProvider(executor)));
	context.subscriptions.push(searchResult, providerRegistrations, findCalleeCmd);    
	context.subscriptions.push(findCallerCmd, findTextCmd, findIncludeCmd);    
}

const defaultConfig = 
'{\n' +
'    "version": "0.0.1",\n' +
'    "open_new_column" : "yes",\n' +
'    "engine_configurations": [\n' +
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
//    const configurations = JSON.parse(loadConfiguration());
    const sourcePaths = configurations.engine_configurations[0].cscope.paths;

    // start with linux command line since this is easier. Later shall change
    // to node api for file search.5
    // Now we are building the database
    vscode.window.showInformationMessage('Building cscope database!');

    const execConfig = {
        cwd: vscode.workspace.rootPath,
        env: process.env};
    let ret = spawnSync("mkdir", ['-p', '.vscode'], execConfig);

    let paths = [];
    sourcePaths.forEach((path) => {
        const fullPath = path.replace("${workspaceRoot}", vscode.workspace.rootPath);
        paths.push(fullPath);
    });

    const executor = new CscopeExecutor(paths, vscode.workspace.rootPath + '/.vscode');
    executor.buildDataBase();

    vscode.window.showInformationMessage('Building finished!');
}

function findSymbol()
{
    openSearch("All references found for symbol:", 0, configurations.open_new_column === "yes");
}

function findDefinition()
{
    openSearch("Definitions found for symbol:", 1, configurations.open_new_column === "yes");
}

function findCallee()
{
    openSearch("All functions called by:", 2, configurations.open_new_column === "yes");
}

function findCaller()
{
    openSearch("All functions who called:", 3, configurations.open_new_column === "yes");
}

function findText()
{
    openSearch("All places occures of text:", 4, configurations.open_new_column === "yes");
}

function findInclude()
{
    openSearch("All files that includes:", 8, configurations.open_new_column === "yes");
}

// this method is called when your extension is deactivated
export function deactivate() {
}