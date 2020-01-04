'use strict';

/*
"default": {
    "config_index" : {
        "cscope" : {
            "win32" : 1,
            "linux" : 0,
            "mac_os" : 0,
            "others" : 0
        }
    },
    "config" : [
        {
            "find_cmd" : "find ${src_path} -type f -name *.c -o -type f -name *.h -o -type f -name *.cpp -o -type f -name *.cc -o -type f -name *.mm",
            "database_cmd" : "cscope -b -q -k",
            "find_all_ref" : "cscope -q -k -L0 ${text}",
            "find_define" : "cscope -q -k -L1 ${text}",
            "find_callee" : "cscope -q -k -L2 ${text}",
            "find_caller" : "cscope -q -k -L3 ${text}",
            "find_text" : "cscope -q -k -L4 ${text}"
        },
        {
            "find_cmd" : "cmd /C dir /s/a/b ${src_path}\\*.c ${src_path}\\*.h ${src_path}\\*.cpp ${src_path}\\*.cc ${src_path}\\*.mm",
            "database_cmd" : "cscope -b -q -k",
            "find_all_ref" : "cscope -q -k -L0 ${text}",
            "find_define" : "cscope -q -k -L1 ${text}",
            "find_callee" : "cscope -q -k -L2 ${text}",
            "find_caller" : "cscope -q -k -L3 ${text}",
            "find_text" : "cscope -q -k -L4 ${text}"
        }
    ]
}
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
            find_all_ref : "cscope -q -k -L0 ${text}",
            find_define : "cscope -q -k -L1 ${text}",
            find_callee : "cscope -q -k -L2 ${text}",
            find_caller : "cscope -q -k -L3 ${text}",
            find_text : "cscope -q -k -L4 ${text}"
        },
        {
            find_cmd : "cmd /C dir /s/a/b ${src_path}\\*.c ${src_path}\\*.h ${src_path}\\*.cpp ${src_path}\\*.cc ${src_path}\\*.mm",
            database_cmd : "cscope -b -q -k",
            find_all_ref : "cscope -q -k -L0 ${text}",
            find_define : "cscope -q -k -L1 ${text}",
            find_callee : "cscope -q -k -L2 ${text}",
            find_caller : "cscope -q -k -L3 ${text}",
            find_text : "cscope -q -k -L4 ${text}"
        }
    ]
};

import CmdParser from '../CmdParser';

describe('cscope_cmd_parser test', () => {

    test('use default setting if there is no settings', () => {
        const parser = new CmdParser(null);
        const engine_cmd_strings = parser.getCurrentCmds();
        expect(engine_cmd_strings).toStrictEqual(cscope_config);
    });

    test('use default setting if setting is empty', () => {
        const config = {};
        const parser = new CmdParser(config);
        const engine_cmd_strings = parser.getCurrentCmds();
        expect(engine_cmd_strings).toStrictEqual(cscope_config);
    });

    test('use default setting if setting has no config index', () => {
        const config = {config_index : {}};
        const parser = new CmdParser(config);
        const engine_cmd_strings = parser.getCurrentCmds();
        expect(engine_cmd_strings).toStrictEqual(cscope_config);
    });

    test('use default setting if config index is unknown', () => {
        const config = {
            config_index : {
                "abc" : {
                    "win32" : 1,
                    "linux" : 0,
                    "mac_os" : 0,
                    "others" : 0
                }        
            }
        };
        const parser = new CmdParser(config);
        const engine_cmd_strings = parser.getCurrentCmds();
        expect(engine_cmd_strings).toStrictEqual(cscope_config);
    });

    test('use default setting if config index is good but config is invalid', () => {
        const config = {
            config_index : {
                "cscope" : {
                    "win32" : 1,
                    "linux" : 0,
                    "mac_os" : 0,
                    "others" : 0
                }        
            }
        };
        const parser = new CmdParser(config);
        const engine_cmd_strings = parser.getCurrentCmds();
        expect(engine_cmd_strings).toStrictEqual(cscope_config);
    });

    test('use default setting if config index is good but config is empty', () => {
        const config = {
            config_index : {
                "cscope" : {
                    "win32" : 1,
                    "linux" : 0,
                    "mac_os" : 0,
                    "others" : 0
                }        
            }
        };
        const parser = new CmdParser(config);
        const engine_cmd_strings = parser.getCurrentCmds();
        expect(engine_cmd_strings).toStrictEqual(cscope_config);
    });

    test('override find files command on linux', () => {
        const config = {
            config_index : {
                "cscope" : {
                    "linux" : 0
                }
            },
            "config" : [
                {
                    "find_cmd" : "my find command"
                }
            ]
        };
        
        const new_config = JSON.parse(JSON.stringify(cscope_config));
        new_config.config[0].find_cmd = "my find command";
        const parser = new CmdParser(config);
        const engine_cmd_strings = parser.getCurrentCmds();
        expect(engine_cmd_strings).toStrictEqual(new_config);
    });

    test('override find files command on linux and index is different', () => {
        const config = {
            config_index : {
                "cscope" : {
                    "linux" : 1
                }
            },
            "config" : [
                {
                },
                {
                    "find_cmd" : "my find command"
                }
            ]
        };
        
        const new_config = JSON.parse(JSON.stringify(cscope_config));
        new_config.config[0].find_cmd = "my find command";
        const parser = new CmdParser(config);
        const engine_cmd_strings = parser.getCurrentCmds();
        expect(engine_cmd_strings).toStrictEqual(new_config);
    });

    test('override find files command on linux and windows using different index', () => {
        const config = {
            config_index : {
                "cscope" : {
                    "linux" : 1,
                    "win32" : 0
                }
            },
            "config" : [
                {
                    "find_cmd" : "my find command win"
                },
                {
                    "find_cmd" : "my find command"
                }
            ]
        };
        
        const new_config = JSON.parse(JSON.stringify(cscope_config));
        new_config.config[0].find_cmd = "my find command";
        new_config.config[1].find_cmd = "my find command win";
        const parser = new CmdParser(config);
        const engine_cmd_strings = parser.getCurrentCmds();
        expect(engine_cmd_strings).toStrictEqual(new_config);
    });

    test('override find files command on linux and windows using same index', () => {
        const config = {
            config_index : {
                "cscope" : {
                    "linux" : 1,
                    "win32" : 1
                }
            },
            "config" : [
                {
                    "find_cmd" : "my find command win"
                },
                {
                    "find_cmd" : "my find command"
                }
            ]
        };
        
        const new_config = JSON.parse(JSON.stringify(cscope_config));
        new_config.config[0].find_cmd = "my find command";
        new_config.config[1].find_cmd = "my find command";
        const parser = new CmdParser(config);
        const engine_cmd_strings = parser.getCurrentCmds();
        expect(engine_cmd_strings).toStrictEqual(new_config);
    });

    test('override different command on linux and windows', () => {
        const config = {
            config_index : {
                "cscope" : {
                    "linux" : 2,
                    "win32" : 1
                }
            },
            "config" : [
                {
                },
                {
                    "database_cmd" : "my databse command win"
                },
                {
                    "find_cmd" : "my find command"
                }
            ]
        };
        
        const new_config = JSON.parse(JSON.stringify(cscope_config));
        new_config.config[0].find_cmd = "my find command";
        new_config.config[1].database_cmd = "my databse command win";
        const parser = new CmdParser(config);
        const engine_cmd_strings = parser.getCurrentCmds();
        expect(engine_cmd_strings).toStrictEqual(new_config);
    });

    test('override multiple command on linux and windows', () => {
        const config = {
            config_index : {
                "cscope" : {
                    "linux" : 2,
                    "win32" : 1
                }
            },
            "config" : [
                {
                },
                {
                    "database_cmd" : "my databse command win",
                    "find_all_ref" : "win find ref",
                    "find_define" : "win find define"
                },
                {
                    "find_cmd" : "my find command",
                    "find_callee" : "linux find callee",
                    "find_caller" : "linux find caller",
                    "find_text" : "linux find text"
                }
            ]
        };
        
        const new_config = JSON.parse(JSON.stringify(cscope_config));
        new_config.config[0].find_cmd = "my find command";
        new_config.config[0].find_callee = "linux find callee";
        new_config.config[0].find_caller = "linux find caller";
        new_config.config[0].find_text = "linux find text";
        new_config.config[1].database_cmd = "my databse command win";
        new_config.config[1].find_all_ref = "win find ref";
        new_config.config[1].find_define = "win find define";
        const parser = new CmdParser(config);
        const engine_cmd_strings = parser.getCurrentCmds();
        expect(engine_cmd_strings).toStrictEqual(new_config);
    });
});

