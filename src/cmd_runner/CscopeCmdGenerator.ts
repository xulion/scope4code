'use strict';

import {CmdGenInterface} from './CmdGenInterface'
const utilities = require('../util/utilities');

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
            database_cmd : "cscope -b -q -k"
        },
        {
            find_cmd : "cmd /C dir /s/a/b ${src_path}\\*.c ${src_path}\\*.h ${src_path}\\*.cpp ${src_path}\\*.cc ${src_path}\\*.mm",
            database_cmd : "cscope -b -q -k"
        }
    ]
};

class CscopeCmdGenerator implements CmdGenInterface {

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

    list_file_cmd() : string {
        return this.getConfig().find_cmd;
    }

    build_database_cmd() : string {
        return this.getConfig().database_cmd;
    }
};

module.exports = CscopeCmdGenerator;