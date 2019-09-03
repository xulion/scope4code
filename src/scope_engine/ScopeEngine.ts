'use strict';

const utilities = require('../util/utilities');
const cmd_builder = require('../cmd_builder/cmd_builder');
const fs = require('fs');
const path = require('path');
import CmdGenInterface from "../cmd_builder/CmdGenInterface";
import {cmd_result, config_variable_str} from '../util/scope4code_def';

export default class ScopeEngine {
    private cmdGenerator : CmdGenInterface;
    private sourceFolders : string[];
    private databasePath : string;
    private lastRunResult : cmd_result;

    constructor (src_folders : string[], database_path : string) {
        this.cmdGenerator = cmd_builder.build();
        this.sourceFolders = src_folders ? src_folders : [];
        this.databasePath = database_path ? database_path : null;
        this.lastRunResult = {
            success : false, code : 0, stdout : "", stderr : "Unkown error"
        };
    }

    public updatePaths(src_folders : string[], database_path : string) {
        this.sourceFolders = src_folders ? src_folders : [];
        this.databasePath = database_path ? database_path : null;
    }

    private filterCmdString(raw_cmd : string, special_string : string, target_string : string) : string {
        return raw_cmd.replace(new RegExp("\\" + special_string, 'g'), target_string);
    }

    private async runSearchCmd(target_cmd : string, search_text : string) : Promise<boolean> {
        target_cmd = this.filterCmdString(target_cmd, config_variable_str.SEARCH_TEXT, search_text);
        target_cmd = this.filterCmdString(target_cmd, config_variable_str.DATABASE_PATH, this.databasePath);
        return await this.runCmdWithText(target_cmd);
    }

    async runCmdWithText(cmd : string) : Promise<boolean> {
        const cmdArray = cmd.split(/[ \t]+/);
        let cmd_ret : cmd_result = {
            success : false, code : 0, stdout : "", stderr : "Unkown error"
        };

        if (this.databasePath) {
            cmd_ret = await utilities.run_command(cmdArray[0], cmdArray.slice(1), {cwd : this.databasePath});
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

    public getStdOut() : string {
        return this.lastRunResult.stdout;
    }

    public getStdErr() : string {
        return this.lastRunResult.stderr;
    }

    public async generateFileList():Promise<boolean> {
        const cmd = this.cmdGenerator.listFileCmd();

        let file_list_string : string = "";
        let result : boolean = true;
        for (let i : number = 0; i < this.sourceFolders.length; ++i) {
            //use for loop instead of for each to easily exit 
            result = await this.runCmdWithText(this.filterCmdString(cmd, config_variable_str.SRC_PATH, this.sourceFolders[i]));
            if (!result) {
                result = false;
                break;
            }
            file_list_string += this.getStdOut();
        }
        if (result) {
            fs.writeFileSync(path.join(this.databasePath, 'cscope.files'), file_list_string);
        }
        return result;
    }

    public async buildDatabase() : Promise<boolean> {
        const cmd = this.cmdGenerator.buildDatabaseCmd();
        return await this.runCmdWithText(this.filterCmdString(cmd, config_variable_str.DATABASE_PATH, this.databasePath));
    }

    public async searchRef(search_text : string) : Promise<boolean> {
        return await this.runSearchCmd(this.cmdGenerator.findAllRefCmd(), search_text);
    }

    public async searchDefinition(search_text : string) : Promise<boolean> {
        return await this.runSearchCmd(this.cmdGenerator.findDefineCmd(), search_text);
    }

    public async searchCallee(search_text : string) : Promise<boolean> {
        return await this.runSearchCmd(this.cmdGenerator.findCalleeCmd(), search_text);
    }

    public async searchCaller(search_text : string) : Promise<boolean> {
        return await this.runSearchCmd(this.cmdGenerator.findCallerCmd(), search_text);
    }

    public async searchText(search_text : string) : Promise<boolean> {
        return await this.runSearchCmd(this.cmdGenerator.findTextCmd(), search_text);
    }

    public async checkTool() : Promise<boolean> {
        return await this.runCmdWithText(this.cmdGenerator.checkToolCmd());
    }
};
