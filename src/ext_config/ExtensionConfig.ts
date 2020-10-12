'use strict';
const fs = require('fs');
import * as vscode from 'vscode';
import {config_field_str, config_variable_str} from '../util/scope4code_def';

export default class ExtensionConfig {

    private extEnabled : boolean = true;
    private lastError : string = "";
    private workspacePath : string = "";
    private workspaceConfig : vscode.WorkspaceConfiguration = null;

    constructor(workspace_config : vscode.WorkspaceConfiguration, 
        workspace_path : string)
    {
        this.workspacePath = workspace_path;
        if (workspace_config.has(config_field_str.SCOPE_ENABLE)) {
            this.extEnabled = workspace_config.get(config_field_str.SCOPE_ENABLE);
        }
    
        this.workspaceConfig = workspace_config;
    }

    private filterPathString(raw_path : string, special_string : string, target_string : string) : string {
        return raw_path.replace(new RegExp("\\" + special_string, 'g'), target_string);
    }

    public getErrorString() : string {
        return this.lastError;
    }

    public enabled() : boolean {
        if (this.workspaceConfig.has(config_field_str.SCOPE_ENABLE)) {
            this.extEnabled = this.workspaceConfig.get(config_field_str.SCOPE_ENABLE);
        }
        return this.extEnabled;
    }

    public getExePath() : string {
        let exe_path = "";
        if (this.enabled()) {
            if (this.workspaceConfig.has(config_field_str.EXE_PATH)) {
                exe_path = this.workspaceConfig.get(config_field_str.EXE_PATH);
            }
        }
        return this.filterPathString(exe_path, config_variable_str.WORK_SPACE_PATH, this.workspacePath);;
    }

    public getDatabasePath() : string {
        let database_path = "${workspaceRoot}/.vscode/cscope";
        if (this.workspaceConfig.has(config_field_str.DATABASE_PATH_STR)) {
            database_path = this.workspaceConfig.get(config_field_str.DATABASE_PATH_STR);
            if (database_path.length === 0) {
                database_path = "${workspaceRoot}/.vscode/cscope";
            }
        }
        return this.filterPathString(database_path, config_variable_str.WORK_SPACE_PATH, this.workspacePath);
    }

    public openInNewCol() : boolean {
        let open_in_new_col = false;
        if (this.workspaceConfig && this.workspaceConfig.has(config_field_str.OPEN_RESULT_IN_NEW_COL)) {
            open_in_new_col = this.workspaceConfig.get(config_field_str.OPEN_RESULT_IN_NEW_COL);
        }
        return open_in_new_col;
    }

    public getSourcePaths() : string[] {
        let src_paths = [];
        if (this.enabled()) {
            let configure_valid = false;
            if (this.workspaceConfig && this.workspaceConfig.has(config_field_str.SOURCE_CODE_PATHS)) {
                let code_paths = [];
                code_paths = this.workspaceConfig.get(config_field_str.SOURCE_CODE_PATHS);

                if (Array.isArray(code_paths)) {
                    configure_valid = true;
                    code_paths.forEach(element => {
                        if (element === element.toString()) {
                            src_paths.push(this.filterPathString(element, config_variable_str.WORK_SPACE_PATH, this.workspacePath));
                        }
                        else {
                            configure_valid = false;
                            this.lastError = "Invalid source path config";
                        }
                    });    
                }
            }

            if (!configure_valid) {
                src_paths = [];
                src_paths.push(this.filterPathString("${workspaceRoot}", config_variable_str.WORK_SPACE_PATH, this.workspacePath));
            }
        }
        return src_paths;
    }

    public getEngineCmdStrings() : object {
        let engine_cmd_srings = null;
        if (this.enabled()) {
            if (this.workspaceConfig && this.workspaceConfig.has(config_field_str.ENGINE_CMD_STR)) {
                engine_cmd_srings = this.workspaceConfig.get(config_field_str.ENGINE_CMD_STR);
            }
        }
        return engine_cmd_srings;
    }

    public getPrintCmd() : boolean {
        let print_commandline = false;
        if (this.enabled()) {
            if (this.workspaceConfig && this.workspaceConfig.has(config_field_str.PRINT_CMD)) {
                print_commandline = this.workspaceConfig.get(config_field_str.PRINT_CMD);
            }
        }
        return print_commandline;
    }
};
