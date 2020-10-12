'use strict';

/*
cscope find command:
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

const spawnSync = require('child_process').spawnSync;
const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const run_command = require("./util/utilities").run_command;
import ScopeEngine from "./scope_engine/ScopeEngine";
import ExtensionConfig from './ext_config/ExtensionConfig';
import SymbolLocation from './SymbolLocation';
import OutputInterface from './OutputInterface';

export default class CscopeExecutor {
    sourcePaths : string[];
    databasePath : string;
    outInf : OutputInterface;
    executorBusy : boolean;
    scopeEngine : ScopeEngine;
    scopConfig : ExtensionConfig;
    userDefinedCmds : object;

    constructor(scope_config : ExtensionConfig, out:OutputInterface) {
        this.sourcePaths = scope_config.getSourcePaths();
        this.databasePath = scope_config.getDatabasePath();
        this.userDefinedCmds = scope_config.getEngineCmdStrings();
        this.outInf = out;
        this.executorBusy = false;
        this.scopConfig = scope_config;

        const exe_option = {
            cwd : this.databasePath,
            env :process.env
        }

        this.scopeEngine = new ScopeEngine(this.sourcePaths, this.databasePath, 
            this.userDefinedCmds, scope_config.getPrintCmd() ? out : null);
    }

    private databaseReady():boolean {
        try {
            fs.accessSync(path.join(this.databasePath, 'cscope.out'), fs.constants.R_OK | fs.constants.W_OK);
            return true;
        }
        catch (err) {
            console.log(err.toString());
            return false;
        }
    }

    public async checkTool():Promise<boolean> {
        const cscopeExecConfig = {
            cwd: this.databasePath
        };

        const result = await this.scopeEngine.checkTool();

        let toolAvailable = false;
        if (result) {
            const stdOut = this.scopeEngine.getStdOut();
            const stdErr = this.scopeEngine.getStdErr();
            if ((stdOut.length > 0) && (stdOut.search("cscope.*version.*") !== -1)){
                toolAvailable = true;
            }
            else if ((stdErr.length > 0) && (stdErr.search("cscope.*version.*") !== -1)){
                toolAvailable = true;
            }
            else {
                this.outInf.updateState("cscope not detected");
            }
        }
        return toolAvailable;
    }

    public async verifyCscope():Promise<boolean> {
        if (!await this.checkTool()) {
            this.outInf.updateState("not detected");
            this.outInf.errorToUser("cscope is not installed (or not added to PATH)");                
            return false;
        }

        if (!this.databaseReady()) {
            this.outInf.updateState("no database");
            return false;
        }

        this.outInf.updateState("database ready");

        return true;
    }

    private async internal_buildDataBase() : Promise<any>
    {
        let result = await this.scopeEngine.generateFileList(this.scopConfig.getExcludedPaths());
        if (!result) {
            this.outInf.notifyUser(this.scopeEngine.getStdErr());
        }

        result = await this.scopeEngine.buildDatabase();
        if (!result) {
            this.outInf.notifyUser(this.scopeEngine.getStdErr());
        }
    
        return result;
    }

    public async buildDataBase() : Promise<boolean>{

        let ret  = false;
        if (!this.executorBusy) {
            this.outInf.updateState("building...");
            const value = await this.checkTool();

            let err_msg : string = "";
            let user_msg : string = "";

            if (value) {

                this.sourcePaths = this.scopConfig.getSourcePaths();
                this.databasePath = this.scopConfig.getDatabasePath();

                this.scopeEngine.updatePaths(this.sourcePaths, this.databasePath);

                ret = await this.internal_buildDataBase();
                if (!ret) {
                    err_msg = this.scopeEngine.getStdErr();
                }
            }
            else {
                this.outInf.updateState("not detected");
            }

            if (ret) {
                this.outInf.updateState("database ready");    
                this.outInf.notifyUser("database build finished.");
            }
            else {
                this.outInf.errorToUser(err_msg);
            }
        }
        else {
            this.outInf.notifyUser("busy.");
        }

        return ret;
    }

    private parseSearchResult(search_result : string, symbol : string) : SymbolLocation[] {
        let list = [];
        const fileList = search_result.split('\n');
        fileList.forEach((line) =>{
            const contents = line.split(' ');
            if (contents.length > 3)
            {
                let fileName = contents[0];
                const lineNum = parseInt(contents[2]);

                let otherText = contents[1];
                for (let i = 3; i < contents.length; ++i)
                {
                    otherText += ` ${contents[i]}`;
                }

                list.push(new SymbolLocation(fileName, lineNum, 0, 0, otherText));
            }
        });
        return list;
    }

    public async runSearch(targetText:string, level:number) : Promise<SymbolLocation[]>{

        if (! await this.verifyCscope()) {
            return null;
        }

        let list = [];

        if (!this.executorBusy) {

            const cscopeExecConfig = {
                cwd: this.databasePath,
                env: process.env
            };

            switch (level) {
                case 0:
                    list = await this.findReferences(targetText);
                    break;

                case 1:
                    list = await this.findDefinition(targetText);
                    break;

                case 2:
                    list = await this.findCallee(targetText);
                    break;

                case 3:
                    list = await this.findCaller(targetText);
                    break;
                
                case 4:
                    list = await this.findText(targetText);
                    break;

                default:
                    break;
            }
        }
        else {
            this.outInf.notifyUser("busy.");
        }

        return list;
    }

    public async findReferences(symbol : string) : Promise<SymbolLocation[]> {
        let list = [];
        if (await this.scopeEngine.searchRef(symbol)) {
            const search_result = this.scopeEngine.getStdOut();
            list = this.parseSearchResult(search_result.toString(), symbol);
        }
        return list;
    }

    public async findDefinition(symbol:string) : Promise<SymbolLocation[]>{
        let list = [];
        if (await this.scopeEngine.searchDefinition(symbol)) {
            const search_result = this.scopeEngine.getStdOut();
            list = this.parseSearchResult(search_result.toString(), symbol);
        }
        return list;
    }

    public async findCallee(symbol:string) : Promise<SymbolLocation[]>{
        let list = [];
        if (await this.scopeEngine.searchCallee(symbol)) {
            const search_result = this.scopeEngine.getStdOut();
            list = this.parseSearchResult(search_result.toString(), symbol);
        }
        return list;
    }

    public async findCaller(symbol:string) : Promise<SymbolLocation[]>{
        let list = [];
        if (await this.scopeEngine.searchCaller(symbol)) {
            const search_result = this.scopeEngine.getStdOut();
            list = this.parseSearchResult(search_result.toString(), symbol);
        }
        return list;
    }

    public async findText(symbol:string) : Promise<SymbolLocation[]>{
        let list = [];
        if (await this.scopeEngine.searchText(symbol)) {
            const search_result = this.scopeEngine.getStdOut();
            list = this.parseSearchResult(search_result.toString(), symbol);
        }
        return list;
    }

    public findPattern(symbol:string):Promise<SymbolLocation[]>{
        return this.runSearch(symbol, 6);
    }

    public findThisFile(symbol:string):Promise<SymbolLocation[]>{
        return this.runSearch(symbol, 7);
    }

    public findIncluder(symbol:string):Promise<SymbolLocation[]>{
        return this.runSearch(symbol, 8);
    }
}
