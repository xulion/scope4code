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
import OutputInterface from './OutputInterface';

var path = require('path');

let configurations = null;
const configPath = vscode.workspace.rootPath + '/.vscode/cscope_conf.json';

let status = null;

function updateStatus(text) {
    if (status) {
        status.text = text;

        if (text) {
            status.show();
        } else {
            status.hide();
        }
    }
}

class VscodeOutput implements OutputInterface {
    diagLog(diagInfo:string) {
        console.log("scope4code: " + diagInfo);
    }

    errorToUser(errorMsg:string) {
        vscode.window.showErrorMessage("scope4code: " + errorMsg);
    }

    notifyUser(msg:string) {
        vscode.window.showInformationMessage('cscope: ' + msg);
    }

    updateState(state:string) {
        updateStatus("cscope: " + state);
    }

};

const out = new VscodeOutput;

function getDatabasePath(database_path_config:string)
{
    let expanded_path=database_path_config.replace('${workspaceRoot}', vscode.workspace.rootPath);
    if (!path.isAbsolute(expanded_path))
    {
        return vscode.workspace.rootPath + '/' + expanded_path;
    }
    return expanded_path;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    //start initializing environment only after a workspace folder is opened
    if (vscode.workspace.rootPath)
    {
        status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        context.subscriptions.push(status);
            
        configurations = JSON.parse(loadConfiguration());
        validateConfiguration(configurations);
        // Use the console to output diagnostic information (console.log) and errors (console.error)
        // This line of code will only be executed once when your extension is activated
        const database_path = getDatabasePath(configurations.engine_configurations[0].cscope.database_path);
        const build_command = configurations.engine_configurations[0].cscope.build_command;

        const executor = new CscopeExecutor(null, database_path, build_command, out);
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
    
    /*    const findIncludeCmd = vscode.commands.registerCommand('extension.findInclude', () => {
            findInclude();
        });*/
    
        context.subscriptions.push(vscode.languages.registerReferenceProvider(["cpp", "c"], new RefProvider(executor)));
//        context.subscriptions.push(vscode.languages.registerDefinitionProvider(['cpp', 'c'], new DefinitionProvider(executor)));
        context.subscriptions.push(searchResult, providerRegistrations, findCalleeCmd);    
        context.subscriptions.push(findCallerCmd, findTextCmd);//, findIncludeCmd);   
        
        //to update status bar
        executor.verifyCscope();
    }
}

const defaultConfig = 
'{\n' +
'    "version": "0.0.13",\n' +
'    "open_new_column" : "no",\n' +
'    "engine_configurations": [\n' +
'        {\n' + 
'            "cscope" : {\n' + 
'                "paths" : [\n' + 
'                    "${workspaceRoot}"\n' + 
'                ],\n' +
'                "build_command" : "",\n' +
'                "database_path" : "${workspaceRoot}/.vscode/cscope"\n' +
'            }\n' +
'        }\n' +
'    ]\n' +
'}';


function validateConfiguration(configuration:any) {
    if (!configuration.engine_configurations[0].cscope.database_path) {
        configuration.engine_configurations[0].cscope.database_path = "${workspaceRoot}/.vscode/cscope";
    }

    if (!configuration.engine_configurations[0].cscope.build_command) {
        configuration.engine_configurations[0].cscope.build_command = "";
    }
}

function loadConfiguration():string
{
    const vscodePath = vscode.workspace.rootPath + '/.vscode';

    try{
        fs.accessSync(vscodePath, fs.constants.R_OK | fs.constants.W_OK);
    }
    catch{
        out.diagLog(".vscode folder does not exist, creating new one");
        fs.mkdirSync(vscodePath);
    }
    
    try{
        fs.accessSync(configPath, fs.constants.R_OK);
    }
    catch{
        out.diagLog("cscope_conf.json does not exist, creating new one");
        fs.writeFileSync(configPath, defaultConfig);
    }

    let configText = fs.readFileSync(configPath).toString();
    try {
        JSON.parse(configText);
    }
    catch{
        out.diagLog("cscope_conf.json is invalid, creating new one");
        fs.writeFileSync(configPath, defaultConfig);
        configText = defaultConfig;
    }

    let configuration = JSON.parse(configText);

    validateConfiguration(configuration);
    const database_path = getDatabasePath(configuration.engine_configurations[0].cscope.database_path)
    try{
        fs.accessSync(database_path, fs.constants.R_OK | fs.constants.W_OK)
    }
    catch{
        out.diagLog("cscope database path does not exist, creating new one");
        fs.mkdirSync(database_path);
    }
    return configText;
}

// Reload and return new configurations if it is valid.
// If any error occured, return the old one.
function reloadConfiguration():any
{
    let ret = configurations;

    try {
        ret = JSON.parse(fs.readFileSync(configPath).toString());
        validateConfiguration(ret);
        const database_path = getDatabasePath(ret.engine_configurations[0].cscope.database_path)
        try{
            fs.accessSync(database_path, fs.constants.R_OK | fs.constants.W_OK)
        }
        catch{
            out.diagLog("cscope database path does not exist, creating new one");
            fs.mkdirSync(database_path);
        }
    }
    catch {
        // Creating new one is not a good idea here
        // because user may not have finished his modification.
        vscode.window.showErrorMessage('cscope_conf.json is invalid');
    }
    return ret;
}

function buildDataBase()
{
    let newConfig = reloadConfiguration();
    const sourcePaths = newConfig.engine_configurations[0].cscope.paths;

    const database_path = getDatabasePath(newConfig.engine_configurations[0].cscope.database_path);
    const build_command = newConfig.engine_configurations[0].cscope.build_command;

    let paths = [];
    sourcePaths.forEach((path) => {
        const fullPath = path.replace("${workspaceRoot}", vscode.workspace.rootPath);
        paths.push(fullPath);
    });

    // start with linux command line since this is easier. Later shall change
    // to node api for file search.5
    // Now we are building the database

    const executor = new CscopeExecutor(paths, database_path, build_command, out);

    if (executor.checkTool()) {
        executor.buildDataBase();
    }
    else {
        vscode.window.showInformationMessage('cscope command is not detected, please ensure cscope command is accessible.');
    }
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