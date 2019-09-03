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

const cscope_config = {
    platform_index : {
        win32 : 1,
        linux : 0,
        mac_os : 0,
        others : 0
    },
    config : [
        {
            find_cmd : "find ${src_path} -type f -name *.c -o -type f -name *.h -o -type f -name *.cpp -o -type f -name *.cc -o -type f -name *.mm",
            database_cmd : "cscope -b -q -k",
            find_all_ref : "cscope -q -L0 ${text}",
            find_define : "cscope -q -L1 ${text}",
            find_callee : "cscope -q -L2 ${text}",
            find_caller : "cscope -q -L3 ${text}",
            find_text : "cscope -q -L4 ${text}"
        },
        {
            find_cmd : "cmd /C dir /s/a/b ${src_path}\\*.c ${src_path}\\*.h ${src_path}\\*.cpp ${src_path}\\*.cc ${src_path}\\*.mm",
            database_cmd : "cscope -b -q -k",
            find_all_ref : "cscope -q -L0 ${text}",
            find_define : "cscope -q -L1 ${text}",
            find_callee : "cscope -q -L2 ${text}",
            find_caller : "cscope -q -L3 ${text}",
            find_text : "cscope -q -L4 ${text}"
        }
    ]
};

export default class CscopeCmdGenerator implements CmdGenInterface {

    private os_type : number;
    constructor () {
        this.os_type = utilities.current_os();
    }

    private getConfig() : any {
        let cmd_config = cscope_config.config[0];
        switch (this.os_type)
        {
            case utilities.constants.OS_LINUX:
                cmd_config = cscope_config.config[cscope_config.platform_index.linux];
                break;

            case utilities.constants.OS_WINDOWS:
                cmd_config = cscope_config.config[cscope_config.platform_index.win32];
                break;

            case utilities.constants.OS_MAC_OS:
                cmd_config = cscope_config.config[cscope_config.platform_index.mac_os];
                break;

            case utilities.constants.OS_UNKOWN:
                cmd_config = cscope_config.config[cscope_config.platform_index.others];
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
