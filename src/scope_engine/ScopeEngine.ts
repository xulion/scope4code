'use strict';

const utilities = require('../util/utilities');
const cmd_builder = require('../cmd_runner/cmd_builder');
const fs = require('fs');
const path = require('path');
import {CmdGenInterface} from "../cmd_runner/CmdGenInterface";
import {cmd_result, config_predefined_str} from '../util/scope4code_def';

class ScopeEngine {
    private cmdGenerator : CmdGenInterface;
    private sourceFolders : string[];
    private databasePath : string;
    private lastRunResult : cmd_result;

    constructor (src_folders : string[], database_path : string) {
        this.cmdGenerator = cmd_builder.build();
        this.sourceFolders = src_folders;
        this.databasePath = database_path;
        this.lastRunResult = {
            success : false, code : 0, stdout : "", stderr : "Unkown error"
        };
    }

    async run_cmd_with_text(cmd : string, exe_path : string) : Promise<boolean> {
        const cmdArray = cmd.split(/[ \t]+/);
        let cmd_ret : cmd_result = {
            success : false, code : 0, stdout : "", stderr : "Unkown error"
        };

        if (exe_path) {
            cmd_ret = await utilities.run_command(cmdArray[0], cmdArray.slice(1), {cwd : exe_path});
        }
        else {
            cmd_ret = await utilities.run_command(cmdArray[0], cmdArray.slice(1));
        }

        this.lastRunResult = cmd_ret;
        if ((cmd_ret.success) && (cmd_ret.code === 0)) {
            return true;
        }
        return false;
    };

    get_std_out() : string {
        return this.lastRunResult.stdout;
    }

    get_std_err() : string {
        return this.lastRunResult.stderr;
    }

    async generate_file_list():Promise<boolean> {
        const cmd = this.cmdGenerator.list_file_cmd();
        const re = new RegExp("\\" + config_predefined_str.SRC_PATH, 'g');

        let file_list_string : string = "";
        let result : boolean = true;
        for (let i : number = 0; i < this.sourceFolders.length; ++i) {
            //use for loop instead of for each to easily exit 
            result = await this.run_cmd_with_text(cmd.replace(re, this.sourceFolders[i]), this.databasePath);
            if (!result) {
                result = false;
                break;
            }
            file_list_string += this.get_std_out();
        }
        if (result) {
            fs.writeFileSync(path.join(this.databasePath, 'cscope.files'), file_list_string);
        }
        return result;
    }

    async build_database() : Promise<boolean> {
        const cmd = this.cmdGenerator.build_database_cmd();
        return await this.run_cmd_with_text(cmd, this.databasePath);
    }
};

module.exports = ScopeEngine;