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
const glob = require('glob');

import SymbolLocation from './SymbolLocation';
import OutputInterface from './OutputInterface';

function cmdRunner(cmd, args, option):Promise<any> {
    return new Promise((resolve, reject) => {
        const ret = spawn(cmd, args, option);
        let result = {
            stdout:[],
            stderr:[]
        };

        ret.stdout.on('data', (data) => {
            result.stdout += data;
        });

        ret.stderr.on('data', (data) => {
            result.stderr = data;
            console.log(data.toString())
        });

        ret.on('close', (code) => {
            resolve(result);
        });
    });
}

export default class CscopeExecutor {
    source_paths:string[];
    database_path:string;
    build_command:string;
    compile_commands_json_path:string;
    outInf:OutputInterface;
    executorBusy:boolean;

    constructor(source_paths:string[], database_path:string, build_command:string, compile_commands_json_path: string, out:OutputInterface)
    {
        this.source_paths = source_paths;
        this.database_path = database_path;
        this.build_command = build_command;
        this.compile_commands_json_path = compile_commands_json_path;
        this.outInf = out;
        this.executorBusy = false;
    }

    private databaseReady():boolean {
        try {
            fs.accessSync(this.database_path + '/cscope.out', fs.constants.R_OK | fs.constants.W_OK);
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

        let result = await cmdRunner("cscope", ['-V'], cscopeExecConfig);

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

    private buildCscopeFilesWithFind()
    {
        let start = true;
        this.source_paths.forEach((path) => {
            const execConfig = {
                cwd: this.database_path,
                env: process.env};
    
            let ret = spawnSync("find", [path, '-type', 'f', '-name', '*.c', 
                            '-o', '-type', 'f', '-name', '*.h', 
                            '-o', '-type', 'f', '-name', '*.cpp', 
                            '-o', '-type', 'f', '-name', '*.cc', 
                            '-o', '-type', 'f', '-name', '*.mm'], execConfig);
            if (ret.stderr.length > 0) {
                console.log(ret.stderr.toString());
                return ret;
            }
            else {
                if (start) {
                    fs.writeFileSync(this.database_path + '/cscope.files', ret.stdout.toString());
                }
                else{
                    fs.appendFileSync(this.database_path + '/cscope.files', ret.stdout.toString());
                }
                start = false;
            }
        });
        return {};
    }

    private buildCscopeFilesFromCompileCommandsJson(compile_commands_json_path:string)
    {
        let compileCommandsText;
        let compileCommands;

        try
        {
            compileCommandsText = fs.readFileSync(compile_commands_json_path);
        } catch(err) {
            return { 'stderr' : 'unable to open ' + compile_commands_json_path };
        }
        try
        {
            compileCommands = JSON.parse(compileCommandsText);
        }
        catch(err)
        {
            return { 'stderr': 'unable to parse ' + compile_commands_json_path };
        }
        const reInclude = /-I([^\s]*)/g;

        const cscopeFiles = this.database_path + '/cscope.files';
        let includeDirs = {};

        fs.writeFileSync(cscopeFiles, '');

        compileCommands.forEach((cu) => {
            fs.appendFileSync(cscopeFiles, cu.file + '\n');

            let match;
            while (match = reInclude.exec(cu.command))
            {
                includeDirs[match[1]] = 1;
            }
        });

        let includeFiles = {};

        for (var dir in includeDirs)
        {
            let files = glob.sync("**/*.{h,hpp}", {cwd : dir, realpath: true});
            files.forEach((file) =>
            {
                includeFiles[file] = 1;
            });
        }

        for (var file in includeFiles)
        {
            fs.appendFileSync(cscopeFiles, file + '\n');
        }
    }

    private internal_buildDataBase() : any
    {
        let ret;

        if (this.compile_commands_json_path !== "")
        {
            ret = this.buildCscopeFilesFromCompileCommandsJson(this.compile_commands_json_path);
        }
        else
        {
            ret = this.buildCscopeFilesWithFind();
        }
        if ((ret.stderr) && (ret.stderr.length > 0))
            return ret;

        const cscopeExecConfig = {
            cwd: this.database_path,
            env: process.env};
        return spawnSync("cscope", ['-b', '-q', '-k'], cscopeExecConfig);

    }

    public buildDataBase():boolean{

        if (!this.executorBusy) {
            this.outInf.updateState("building...");
            this.checkToolSync().then( (value) => {
                let ret;

                if (this.build_command === "")
                {
                    ret = this.internal_buildDataBase();
                }
                else
                {
                    const cscopeExecConfig = {
                        cwd: this.database_path,
                        env: process.env};
                    let args = this.build_command.split(" ");
                    const cmd = args.shift();

                    ret = spawnSync(cmd, args, cscopeExecConfig);
                }
                if (value) {
                    if ((ret.stderr) && (ret.stderr.length > 0)) {
                        this.outInf.errorToUser(ret.stderr.toString());
                        this.outInf.updateState("failed");
                    }
                    else if (ret.stdout.toString().search("fail") === 0) {
                        this.outInf.errorToUser(ret.stdout.toString());
                        this.outInf.updateState("failed");
                    }
                    else {
                        this.outInf.notifyUser("database build finished.");
                        this.outInf.updateState("database ready");    
                    }
                }
                else {
                    this.outInf.updateState("not detected");
                }
            })
        }
        else {
            this.outInf.notifyUser("busy.");
        }

        return true;
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
