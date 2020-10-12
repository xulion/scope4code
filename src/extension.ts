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
import ExtensionConfig from "./ext_config/ExtensionConfig";
var path = require('path');

function get_config_path() : string {
    return path.join(vscode.workspace.rootPath, '/.vscode/cscope_conf.json');
};

let status = null;
let ext_config : ExtensionConfig = null;
let executor : CscopeExecutor = null;

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

const out : VscodeOutput = new VscodeOutput;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    //start initializing environment only after a workspace folder is opened
    let enableScope = false;

    if (vscode.workspace.rootPath) {
        const myconfig = vscode.workspace.getConfiguration('scope4code');
        ext_config = new ExtensionConfig(myconfig, vscode.workspace.rootPath);
        enableScope = ext_config.enabled();
    }

    if (enableScope) {
        status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        context.subscriptions.push(status);
        
//        configurations = JSON.parse(loadConfiguration());
//        validateConfiguration(configurations);
        // Use the console to output diagnostic information (console.log) and errors (console.error)
        // This line of code will only be executed once when your extension is activated
//        const database_path = getDatabasePath(configurations.engine_configurations[0].cscope.database_path);
//        const build_command = configurations.engine_configurations[0].cscope.build_command;
        const database_path = ext_config.getDatabasePath();
        process.env.PATH = ext_config.getExePath() + ":" + process.env.PATH;
        console.log(process.env.PATH);

        try{
            fs.accessSync(path.join(vscode.workspace.rootPath, ".vscode"), fs.constants.R_OK | fs.constants.W_OK)
        }
        catch{
            out.diagLog(".vscode folder does not exist, creating new one");
            fs.mkdirSync(path.join(vscode.workspace.rootPath, ".vscode"));
        }

        try{
            fs.accessSync(database_path, fs.constants.R_OK | fs.constants.W_OK)
        }
        catch{
            out.diagLog("cscope database folder does not exist, creating new one");
            fs.mkdirSync(database_path);
        }
    
        executor = new CscopeExecutor(ext_config, out);
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
        context.subscriptions.push(vscode.languages.registerDefinitionProvider(['cpp', 'c'], new DefinitionProvider(executor)));
        context.subscriptions.push(searchResult, providerRegistrations, findCalleeCmd);    
        context.subscriptions.push(findCallerCmd, findTextCmd);//, findIncludeCmd);   
        
        //to update status bar
        executor.verifyCscope();
    }
}

function validateConfiguration(configuration:any) {
    if (!configuration.engine_configurations[0].cscope.database_path) {
        configuration.engine_configurations[0].cscope.database_path = "${workspaceRoot}/.vscode/cscope";
    }

    if (!configuration.engine_configurations[0].cscope.build_command) {
        configuration.engine_configurations[0].cscope.build_command = "";
    }
}

async function buildDataBase()
{
    const sourcePaths = ext_config.getSourcePaths();

    const database_path = ext_config.getDatabasePath();

    let paths = [];
    sourcePaths.forEach((path) => {
        const fullPath = path.replace("${workspaceRoot}", vscode.workspace.rootPath);
        paths.push(fullPath);
    });

    const executor = new CscopeExecutor(ext_config, out);

    if (await executor.checkTool()) {
        await executor.buildDataBase();
    }
    else {
        vscode.window.showInformationMessage('cscope command is not detected, please ensure cscope command is accessible.');
    }
}

function findSymbol()
{
    openSearch("All references found for symbol:", 0, ext_config.openInNewCol());
}

function findDefinition()
{
    openSearch("Definitions found for symbol:", 1, ext_config.openInNewCol());
}

function findCallee()
{
    openSearch("All functions called by:", 2, ext_config.openInNewCol());
}

function findCaller()
{
    openSearch("All functions who called:", 3, ext_config.openInNewCol());
}

function findText()
{
    openSearch("All places occures of text:", 4, ext_config.openInNewCol());
}

function findInclude()
{
    openSearch("All files that includes:", 8, ext_config.openInNewCol());
}

// this method is called when your extension is deactivated
export function deactivate() {
}