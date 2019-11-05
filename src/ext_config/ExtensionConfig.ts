'use strict';
const fs = require('fs');
import * as vscode from 'vscode';
import {config_field_str, config_variable_str} from '../util/scope4code_def';

const default_config = {
    "version": "0.0.13",
    "open_new_column" : "no",
    "engine_configurations": [
        {
            "cscope" : {
                "paths" : [
                    "${workspaceRoot}"
                ],
                "build_command" : "",
                "database_path" : "${workspaceRoot}/.vscode/cscope"
            }
        }
    ]
}

export default class ExtensionConfig {

    private extEnabled : boolean = true;
    private printCmd : boolean = false;
    private exePath : string = "";
    private scopeConfig : any = null;
    private configJsonPath : string = "";
    private lastError : string = "";
    private workspacePath : string = "";
    private workspaceConfig : vscode.WorkspaceConfiguration = null;

    constructor(workspace_config : vscode.WorkspaceConfiguration, 
        config_json_path : string,
        workspace_path : string)
    {
        this.workspacePath = workspace_path;
        if (workspace_config.has(config_field_str.SCOPE_ENABLE)) {
            this.extEnabled = workspace_config.get(config_field_str.SCOPE_ENABLE);
        }
    
        if (workspace_config.has(config_field_str.EXE_PATH)) {
            this.exePath = workspace_config.get(config_field_str.EXE_PATH);
        }

        if (workspace_config.has(config_field_str.PRINT_CMD)) {
            this.printCmd = workspace_config.get(config_field_str.PRINT_CMD);
        }
        this.configJsonPath = config_json_path;
        this.workspaceConfig = workspace_config;
    }

    private filterPathString(raw_path : string, special_string : string, target_string : string) : string {
        return raw_path.replace(new RegExp("\\" + special_string, 'g'), target_string);
    }

    public validateConfig() : boolean {
        let validConfig = true;
        try {
            fs.accessSync(this.configJsonPath, fs.constants.R_OK);
            this.scopeConfig = JSON.parse(fs.readFileSync(this.configJsonPath).toString()); 
        }
        catch(err) {
            //do nothing but generate new one
            validConfig = false;
            this.scopeConfig = default_config;
            this.lastError = "No config json exist or config is invalid. Use default";
        }

        if (!this.scopeConfig) {
            this.scopeConfig = default_config;
        }
        else
        {
            if (!this.scopeConfig.open_new_column) { 
                this.scopeConfig.open_new_column = default_config.open_new_column;
            }

            if ((this.scopeConfig.open_new_column.toLowerCase() != "yes") &&
            (this.scopeConfig.open_new_column.toLowerCase() != "no")) {
                this.scopeConfig.open_new_column = default_config.open_new_column;
            }
            if (!Array.isArray(this.scopeConfig.engine_configurations)) {
                this.scopeConfig.engine_configurations = default_config.engine_configurations;
            }
            if (this.scopeConfig.engine_configurations.length == 0) {
                this.scopeConfig.engine_configurations = default_config.engine_configurations;
            }
            if (!this.scopeConfig.engine_configurations[0].cscope) {
                this.scopeConfig.engine_configurations[0].cscope = default_config.engine_configurations[0].cscope;
            }
        
            if (!this.scopeConfig.engine_configurations[0].cscope.database_path) {
                this.scopeConfig.engine_configurations[0].cscope.database_path = default_config.engine_configurations[0].cscope.database_path;
            }
            if (!this.scopeConfig.engine_configurations[0].cscope.paths) {
                this.scopeConfig.engine_configurations[0].cscope.paths = default_config.engine_configurations[0].cscope.paths;
            }
            if (!this.scopeConfig.engine_configurations[0].cscope.build_command) {
                this.scopeConfig.engine_configurations[0].cscope.build_command = default_config.engine_configurations[0].cscope.build_command;
            }
        }
        return validConfig;
    }

    public getErrorString() : string {
        return this.lastError;
    }

    public enabled() : boolean {
        return this.extEnabled;
    }

    public getExePath() : string {
        let exe_path = "";
        if (this.extEnabled) {
            exe_path = this.exePath;
        }
        return exe_path;
    }

    public getDatabasePath() : string {
        return this.filterPathString(this.scopeConfig.engine_configurations[0].cscope.database_path,
            config_variable_str.WORK_SPACE_PATH, this.workspacePath);
    }

    public openInNewCol() : boolean {
        return (this.scopeConfig.open_new_column.toLowerCase() == "yes") ? true : false;
    }

    public getSourcePaths() : string[] {
        let src_paths = [];
        this.scopeConfig.engine_configurations[0].cscope.paths.forEach(element => {
            src_paths.push(this.filterPathString(element, config_variable_str.WORK_SPACE_PATH, this.workspacePath))
        });
        
        return src_paths;
    }

    //shall be removed laterworkspaceConfig
    public getBuildCmd() : string {
        return this.scopeConfig.engine_configurations[0].cscope.build_command;
    }

    public getEngineCmdStrings() : object {
        let engine_cmd_srings = null;
        if (this.workspaceConfig && this.workspaceConfig.has(config_field_str.ENGINE_CMD_STR)) {
            engine_cmd_srings = this.workspaceConfig.get(config_field_str.ENGINE_CMD_STR);
        }
        return engine_cmd_srings;
    }

    public getPrintCmd() : boolean {
        return this.printCmd;
    }
};
