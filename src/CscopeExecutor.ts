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
const ScopeEngine = require("./scope_engine/ScopeEngine");
import SymbolLocation from './SymbolLocation';
import OutputInterface from './OutputInterface';

export default class CscopeExecutor {
    source_paths : string[];
    database_path : string;
    build_command : string;
    outInf : OutputInterface;
    executorBusy : boolean;
    scopeEngine : any;

    constructor(source_paths:string[], database_path:string, build_command:string, out:OutputInterface)
    {
        this.source_paths = source_paths;
        this.database_path = database_path;
        this.build_command = build_command;
        this.outInf = out;
        this.executorBusy = false;
        this.scopeEngine = new ScopeEngine(source_paths, database_path);
    }

    private databaseReady():boolean {
        try {
            fs.accessSync(path.join(this.database_path, '/cscope.out'), fs.constants.R_OK | fs.constants.W_OK);
            return true;
        }
        catch (err)
        {
            console.log(err.toString());
            return false;
        }
    }

    private async checkToolSync():Promise<boolean> {
        const cscopeExecConfig = {
            cwd: this.database_path,
            env: process.env};

        let result = await run_command("cscope", ['-V'], cscopeExecConfig);

        let toolAvailable = false;
        if ((result.stdout) && (result.stdout.length > 0))
        {
            if (result.stdout.toString().search("cscope: version.*") === 0)
            {
                toolAvailable = true;
            }                
        }
        else if ((result.stderr) && (result.stderr.length > 0)){
            if (result.stderr.toString().search("cscope: version.*") === 0)
            {
                toolAvailable = true;
            }
            else{
                this.outInf.updateState("not detected");
            }
    
        } 

        return toolAvailable;
    }

    public checkTool():boolean{
        const cscopeExecConfig = {
            cwd: this.database_path,
            env: process.env};

        const ret = spawnSync("cscope", ['-V'], cscopeExecConfig);
        let toolAvailable = false;
        if ((ret.stdout) && (ret.stdout.length > 0))
        {
            if (ret.stdout.toString().search("cscope: version.*") === 0)
            {
                toolAvailable = true;
            }                
        }
        else if ((ret.stderr) && (ret.stderr.length > 0)){
            if (ret.stderr.toString().search("cscope: version.*") === 0)
            {
                toolAvailable = true;
            }
            else{
                this.outInf.updateState("not detected");
            }
    
        } 
        return toolAvailable;
    }

    public verifyCscope():boolean {
        if (!this.checkTool())
        {
            this.outInf.updateState("not detected");
            this.outInf.errorToUser("cscope is not installed (or not added to PATH)");                
            return false;
        }

        if (!this.databaseReady())
        {
            this.outInf.updateState("no database");
            return false;
        }

        this.outInf.updateState("database ready");

        return true;
    }

    private async internal_buildDataBase() : Promise<any>
    {
        let result = await this.scopeEngine.generate_file_list();
        if (!result) {
            console.log(this.scopeEngine.get_std_err());
        }

        result = await this.scopeEngine.build_database();
        if (!result) {
            console.log(this.scopeEngine.get_std_err());
        }
    
        return result;
    }

    public async buildDataBase() : Promise<boolean>{

        let ret  = false;
        if (!this.executorBusy) {
            this.outInf.updateState("building...");
            const value = await this.checkToolSync();

            let err_msg : string = "";
            let user_msg : string = "";

            if (value) {

                if (this.build_command === "") {
                    ret = await this.internal_buildDataBase();
                    if (!ret) {
                        err_msg = this.scopeEngine.get_std_err();
                    }
                }
                else
                {    
                    const cscopeExecConfig = {
                        cwd: this.database_path,
                        env: process.env
                    };
                    
                    let args = this.build_command.split(" ");
                    const cmd = args.shift();

                    const build_ret = spawnSync(cmd, args, cscopeExecConfig);

                    if ((build_ret.stderr) && (build_ret.stderr.length > 0)) {
                        err_msg = build_ret.stderr.toString();
                    }
                    else if (build_ret.stdout.toString().search("fail") === 0) {
                        err_msg = build_ret.stdout.toString();
                    }
                    else {
                        ret = true;
                    }
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

    public execCommand(targetText:string, level:number):SymbolLocation[]{

        if (!this.verifyCscope()) {
            return null;
        }

        let list = [];

        if (!this.executorBusy) {

            const cscopeExecConfig = {
            cwd: this.database_path,
            env: process.env};

            let ret = spawnSync("cscope", ['-q', '-L' + level + targetText], cscopeExecConfig);
            const fileList = ret.stdout.toString().split('\n');
            fileList.forEach((line) =>{
                const contents = line.split(' ');
                if (contents.length > 3)
                {
                    let fileName = contents[0];
    //                console.log(fileName);
                    const lineNum = parseInt(contents[2]);

                    let otherText = contents[1];
                    for (let i = 3; i < contents.length; ++i)
                    {
                        otherText += ` ${contents[i]}`;
                    }

                    list.push(new SymbolLocation(fileName, lineNum, 0, 0, otherText));
                }
            });
        }
        else {
            this.outInf.notifyUser("busy.");
        }

        return list;
    }

    public findReferences(symbol:string):SymbolLocation[]{
        return this.execCommand(symbol, 0);
    }

    public findDefinition(symbol:string):SymbolLocation[]{
        return this.execCommand(symbol, 1);
    }

    findCallee(symbol:string):SymbolLocation[]{
        return this.execCommand(symbol, 2);
    }

    findCaller(symbol:string):SymbolLocation[]{
        return this.execCommand(symbol, 3);
    }

    findText(symbol:string):SymbolLocation[]{
        return this.execCommand(symbol, 4);
    }

    findPattern(symbol:string):SymbolLocation[]{
        return this.execCommand(symbol, 6);
    }

    findThisFile(symbol:string):SymbolLocation[]{
        return this.execCommand(symbol, 7);
    }

    findIncluder(symbol:string):SymbolLocation[]{
        return this.execCommand(symbol, 8);
    }
}
