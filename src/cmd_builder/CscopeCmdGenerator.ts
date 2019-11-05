'use strict';

import CmdGenInterface from './CmdGenInterface'
const utilities = require('../util/utilities');

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


export default class CscopeCmdGenerator implements CmdGenInterface {

    private os_type : number;
    private cscopeConfig : any;
    constructor (cscop_config : object) {
        this.os_type = utilities.current_os();
        this.cscopeConfig = cscop_config;
    }

    private getConfig() : any {
        let cmd_config = this.cscopeConfig.config[0];
        switch (this.os_type)
        {
            case utilities.constants.OS_LINUX:
                cmd_config = this.cscopeConfig.config[this.cscopeConfig.platform_index.linux];
                break;

            case utilities.constants.OS_WINDOWS:
                cmd_config = this.cscopeConfig.config[this.cscopeConfig.platform_index.win32];
                break;

            case utilities.constants.OS_MAC_OS:
                cmd_config = this.cscopeConfig.config[this.cscopeConfig.platform_index.mac_os];
                break;

            case utilities.constants.OS_UNKOWN:
                cmd_config = this.cscopeConfig.config[this.cscopeConfig.platform_index.others];
                break;

                default:
                break;
        }
        return cmd_config;
    }

    public listFileCmd() : string {
        return this.getConfig().find_cmd;
    }

    public buildDatabaseCmd() : string {
        return this.getConfig().database_cmd;
    }

    public findAllRefCmd() : string {
        return this.getConfig().find_all_ref;
    }

    public findDefineCmd() : string {
        return this.getConfig().find_define;
    }

    public findCalleeCmd() : string {
        return this.getConfig().find_callee;
    }

    public findCallerCmd() : string {
        return this.getConfig().find_caller;
    }

    public findTextCmd() : string {
        return this.getConfig().find_text;
    }

    public checkToolCmd() : string {
        return "cscope -V";
    }
};
