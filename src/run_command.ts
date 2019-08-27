'use strict';

const spawn = require('child_process').spawn;

export function run_command(cmd:string, args?:any, option?:any): Promise<any> {
    return new Promise((resolve, reject) => {
        let result = {
            success:true,
            code : 0,
            stdout:"",
            stderr:""
        };
    
        try {
            const child = spawn(cmd, args, option);

            child.stdout.on("data", (data)=>{
                result.stdout += data.toString();
            });

            child.stderr.on("data", (data)=>{
                result.stderr += data.toString();
            });

            child.on("close", (code)=>{
                result.code = code;
                resolve(result);
            });
        }
        catch (error) {
            result.stderr += error;
            result.success = false;
            resolve(result);
        }
    });
};
