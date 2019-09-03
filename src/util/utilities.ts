'use strict';

const _spawn = require('child_process').spawn;
const _os = require('os');
import {os_constants, cmd_result} from "./scope4code_def";

function _run_command(cmd:string, args?:string[], option?:Object): Promise<cmd_result> {
    return new Promise((resolve, reject) => {
        const result = {
            success:true,
            code : 0,
            stdout:"",
            stderr:""
        };
    
        try {
            const child = _spawn(cmd, args, option);

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

            child.on("error", (err)=>{
                result.stderr = err.message;
                result.success = false;
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

function _current_os() :number {
    const os_platform = _os.platform();

    if (os_platform === "linux") {
        return os_constants.OS_LINUX;
    }
    else if (os_platform === "win32") {
        return os_constants.OS_WINDOWS;
    }
    else if (os_platform === "darwin") {
        return os_constants.OS_MAC_OS;
    }

    return os_constants.OS_UNKOWN;
}

function _resolve_path(origin_path : string) : string {
    if (origin_path) {
        return origin_path;
    }
    return null;
}

module.exports = {
    constants : os_constants,
    run_command : _run_command,
    current_os : _current_os,
    resolve_path : _resolve_path
}
