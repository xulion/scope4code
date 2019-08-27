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

export const config_predefined_str = {
    SRC_PATH : "${src_path}",
    DATABASE_PATH : "${database_path}"
};