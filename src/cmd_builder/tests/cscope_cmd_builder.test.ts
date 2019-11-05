'use strict';

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

const _cscope_config = {
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


import CmdGenInterface from '../CmdGenInterface';

describe('cscope cmd_builder test', () => {

    const utilities = require('../../util/utilities');
    jest.mock("../../util/utilities");
    const cmd_builder = require('../cmd_builder');

    //--------------------------------------------------------------------
    //test list file command
    test('create cmd object for linux', () => {
        utilities.current_os.mockReturnValueOnce(utilities.constants.OS_LINUX);
        const cmdGenerator = cmd_builder.build(_cscope_config);
        expect(utilities.current_os).toBeCalledTimes(1);
        utilities.current_os.mockReset();

        const list_cmd = cmdGenerator.listFileCmd();

        expect(list_cmd).toBe("find ${src_path} -type f -name *.c" +
                                  " -o -type f -name *.h" +  
                                  " -o -type f -name *.cpp" + 
                                  " -o -type f -name *.cc" +
                                  " -o -type f -name *.mm");

        const build_database_cmd = cmdGenerator.buildDatabaseCmd();
        expect(build_database_cmd).toBe("cscope -b -q -k");

        const find_all_ref_cmd = cmdGenerator.findAllRefCmd();
        expect(find_all_ref_cmd).toBe("cscope -L0 ${text}");

        const find_define_cmd = cmdGenerator.findDefineCmd();
        expect(find_define_cmd).toBe("cscope -L1 ${text}");

        const find_callee_cmd = cmdGenerator.findCalleeCmd();
        expect(find_callee_cmd).toBe("cscope -L2 ${text}");

        const find_caller_cmd = cmdGenerator.findCallerCmd();
        expect(find_caller_cmd).toBe("cscope -L3 ${text}");

        const find_text_cmd = cmdGenerator.findTextCmd();
        expect(find_text_cmd).toBe("cscope -L4 ${text}");
    });

    test('create cmd object for windows', () => {
        utilities.current_os.mockReturnValueOnce(utilities.constants.OS_WINDOWS);
        const cmdGenerator = cmd_builder.build(_cscope_config);
        expect(utilities.current_os).toBeCalledTimes(1);
        utilities.current_os.mockReset();

        const list_cmd = cmdGenerator.listFileCmd();
        expect(list_cmd).toBe("cmd /C dir /s/a/b ${src_path}\\*.c ${src_path}\\*.h ${src_path}\\*.cpp" +
                              " ${src_path}\\*.cc ${src_path}\\*.mm");

        const build_database_cmd = cmdGenerator.buildDatabaseCmd();
        expect(build_database_cmd).toBe("cscope -b -q -k");

        const find_all_ref_cmd = cmdGenerator.findAllRefCmd();
        expect(find_all_ref_cmd).toBe("cscope -L0 ${text}");

        const find_define_cmd = cmdGenerator.findDefineCmd();
        expect(find_define_cmd).toBe("cscope -L1 ${text}");

        const find_callee_cmd = cmdGenerator.findCalleeCmd();
        expect(find_callee_cmd).toBe("cscope -L2 ${text}");

        const find_caller_cmd = cmdGenerator.findCallerCmd();
        expect(find_caller_cmd).toBe("cscope -L3 ${text}");

        const find_text_cmd = cmdGenerator.findTextCmd();
        expect(find_text_cmd).toBe("cscope -L4 ${text}");
    });

    test('create cmd object for mac_os', () => {
        utilities.current_os.mockReturnValueOnce(utilities.constants.OS_MAC_OS);
        const cmdGenerator = cmd_builder.build(_cscope_config);
        expect(utilities.current_os).toBeCalledTimes(1);
        utilities.current_os.mockReset();

        const list_cmd = cmdGenerator.listFileCmd();
        expect(list_cmd).toBe("find ${src_path} -type f -name *.c" +
                                  " -o -type f -name *.h" +  
                                  " -o -type f -name *.cpp" + 
                                  " -o -type f -name *.cc" +
                                  " -o -type f -name *.mm");

        const build_database_cmd = cmdGenerator.buildDatabaseCmd();
        expect(build_database_cmd).toBe("cscope -b -q -k");

        const find_all_ref_cmd = cmdGenerator.findAllRefCmd();
        expect(find_all_ref_cmd).toBe("cscope -L0 ${text}");

        const find_define_cmd = cmdGenerator.findDefineCmd();
        expect(find_define_cmd).toBe("cscope -L1 ${text}");

        const find_callee_cmd = cmdGenerator.findCalleeCmd();
        expect(find_callee_cmd).toBe("cscope -L2 ${text}");

        const find_caller_cmd = cmdGenerator.findCallerCmd();
        expect(find_caller_cmd).toBe("cscope -L3 ${text}");

        const find_text_cmd = cmdGenerator.findTextCmd();
        expect(find_text_cmd).toBe("cscope -L4 ${text}");
    });

    test('create cmd object for mac_os', () => {
        utilities.current_os.mockReturnValueOnce(utilities.constants.OS_UNKOWN);
        const cmdGenerator = cmd_builder.build(_cscope_config);
        expect(utilities.current_os).toBeCalledTimes(1);
        utilities.current_os.mockReset();

        const list_cmd = cmdGenerator.listFileCmd();
        expect(list_cmd).toBe("find ${src_path} -type f -name *.c" +
                                  " -o -type f -name *.h" +  
                                  " -o -type f -name *.cpp" + 
                                  " -o -type f -name *.cc" +
                                  " -o -type f -name *.mm");
        
        const build_database_cmd = cmdGenerator.buildDatabaseCmd();
        expect(build_database_cmd).toBe("cscope -b -q -k");

        const find_all_ref_cmd = cmdGenerator.findAllRefCmd();
        expect(find_all_ref_cmd).toBe("cscope -L0 ${text}");

        const find_define_cmd = cmdGenerator.findDefineCmd();
        expect(find_define_cmd).toBe("cscope -L1 ${text}");

        const find_callee_cmd = cmdGenerator.findCalleeCmd();
        expect(find_callee_cmd).toBe("cscope -L2 ${text}");

        const find_caller_cmd = cmdGenerator.findCallerCmd();
        expect(find_caller_cmd).toBe("cscope -L3 ${text}");

        const find_text_cmd = cmdGenerator.findTextCmd();
        expect(find_text_cmd).toBe("cscope -L4 ${text}");
    });

    test('checkTool shall return false if command line returns nothing', () => {
        utilities.current_os.mockReturnValueOnce(utilities.constants.OS_UNKOWN);
        const cmdGenerator = cmd_builder.build(_cscope_config);

        const result : CmdGenInterface = cmdGenerator.checkToolCmd();
        expect(result).toBe("cscope -V"); 
    });
});