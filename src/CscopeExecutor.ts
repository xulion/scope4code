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
const fs = require('fs');
import SymbolLocation from './SymbolLocation';

export default class CscopeExecutor {
    source_paths:string[];
    exec_path:string;

    constructor(source_paths:string[], exec_path:string)
    {
        this.source_paths = source_paths;
        this.exec_path = exec_path;
    }

    public checkTool():boolean{
        const cscopeExecConfig = {
            cwd: this.exec_path,
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
                console.log(ret.stderr.toString());                
            }
    
        } 
        return toolAvailable;
    }

    public buildDataBase():boolean{
        let start = true;
        this.source_paths.forEach((path) => {
            const execConfig = {
                cwd: this.exec_path,
                env: process.env};
    
            let ret = spawnSync("mkdir", ['-p', 'cscope'], execConfig);
            ret = spawnSync("find", [path, '-type', 'f', '-name', '*.c', 
                               '-o', '-type', 'f', '-name', '*.h', 
                               '-o', '-type', 'f', '-name', '*.cpp', 
                               '-o', '-type', 'f', '-name', '*.cc', 
                               '-o', '-type', 'f', '-name', '*.mm'], execConfig);
            if (ret.stderr.length > 0) {
                console.log(ret.stderr.toString());
            }
            else {
                if (start) {
                    fs.writeFileSync(this.exec_path + '/cscope/cscope.files', ret.stdout.toString());
                }
                else{
                    fs.appendFileSync(this.exec_path + '/cscope/cscope.files', ret.stdout.toString());
                }
                start = false;
            }
        });
    
        const cscopeExecConfig = {
            cwd: this.exec_path + '/cscope',
            env: process.env};
        const ret = spawnSync("cscope", ['-b', '-q', '-k'], cscopeExecConfig);
        return true;
    }

    public execCommand(targetText:string, level:number):SymbolLocation[]{
        const cscopeExecConfig = {
            cwd: this.exec_path + '/cscope',
            env: process.env};

        let ret = spawnSync("cscope", ['-L' + level + targetText], cscopeExecConfig);
        const fileList = ret.stdout.toString().split('\n');
        let list = [];
        fileList.forEach((line) =>{
            const contents = line.split(' ');
            if (contents.length > 3)
            {
                let fileName = contents[0];
                console.log(fileName);
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
