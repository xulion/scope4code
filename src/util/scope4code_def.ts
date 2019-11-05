'use strict';

export const os_constants = {
    OS_UNKOWN : 0,
    OS_WINDOWS : 1,
    OS_LINUX : 2,
    OS_MAC_OS : 3
};

export class cmd_result {
    success : boolean;  //success means cmd is successfully executed. 
                        //result could be either success or fail.
    code : number;
    stdout : string;
    stderr : string;
};

export const config_variable_str = {
    SRC_PATH : "${src_path}",
    DATABASE_PATH : "${database_path}",
    SEARCH_TEXT : "${text}",
    WORK_SPACE_PATH : "${workspaceRoot}"
};

export const config_field_str = {
    SCOPE_ENABLE : "enableScope",
    EXE_PATH : "executablePath",
    PRINT_CMD : "printCmdBeforeExecute",
    ENGINE_CMD_STR : "engineCommands",
};

export const default_config_values = {

}
