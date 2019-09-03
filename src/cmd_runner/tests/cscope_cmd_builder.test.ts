'use strict';

describe('cmd_builder test', () => {

    const utilities = require('../../util/utilities');
    jest.mock("../../util/utilities");
    const cmd_builder = require('../cmd_builder');

    //--------------------------------------------------------------------
    //test list file command
    test('create cmd object for linux', () => {
        utilities.current_os.mockReturnValueOnce(utilities.constants.OS_LINUX);
        const cmdGenerator = cmd_builder.build();
        expect(utilities.current_os).toBeCalledTimes(1);
        utilities.current_os.mockReset();

        const list_cmd = cmdGenerator.list_file_cmd();

        expect(list_cmd).toBe("find ${src_path} -type f -name *.c" +
                                  " -o -type f -name *.h" +  
                                  " -o -type f -name *.cpp" + 
                                  " -o -type f -name *.cc" +
                                  " -o -type f -name *.mm");

        const build_database_cmd = cmdGenerator.build_database_cmd();
        expect(build_database_cmd).toBe("cscope -b -q -k");
    });

    test('create cmd object for windows', () => {
        utilities.current_os.mockReturnValueOnce(utilities.constants.OS_WINDOWS);
        const cmdGenerator = cmd_builder.build();
        expect(utilities.current_os).toBeCalledTimes(1);
        utilities.current_os.mockReset();

        const list_cmd = cmdGenerator.list_file_cmd();
        expect(list_cmd).toBe("cmd /C dir /s/a/b ${src_path}\\*.c ${src_path}\\*.h ${src_path}\\*.cpp" +
                              " ${src_path}\\*.cc ${src_path}\\*.mm");

        const build_database_cmd = cmdGenerator.build_database_cmd();
        expect(build_database_cmd).toBe("cscope -b -q -k");
    });

    test('create cmd object for mac_os', () => {
        utilities.current_os.mockReturnValueOnce(utilities.constants.OS_MAC_OS);
        const cmdGenerator = cmd_builder.build();
        expect(utilities.current_os).toBeCalledTimes(1);
        utilities.current_os.mockReset();

        const list_cmd = cmdGenerator.list_file_cmd();
        expect(list_cmd).toBe("find ${src_path} -type f -name *.c" +
                                  " -o -type f -name *.h" +  
                                  " -o -type f -name *.cpp" + 
                                  " -o -type f -name *.cc" +
                                  " -o -type f -name *.mm");

        const build_database_cmd = cmdGenerator.build_database_cmd();
        expect(build_database_cmd).toBe("cscope -b -q -k");
    });

    test('create cmd object for mac_os', () => {
        utilities.current_os.mockReturnValueOnce(utilities.constants.OS_UNKOWN);
        const cmdGenerator = cmd_builder.build();
        expect(utilities.current_os).toBeCalledTimes(1);
        utilities.current_os.mockReset();

        const list_cmd = cmdGenerator.list_file_cmd();
        expect(list_cmd).toBe("find ${src_path} -type f -name *.c" +
                                  " -o -type f -name *.h" +  
                                  " -o -type f -name *.cpp" + 
                                  " -o -type f -name *.cc" +
                                  " -o -type f -name *.mm");
        
        const build_database_cmd = cmdGenerator.build_database_cmd();
        expect(build_database_cmd).toBe("cscope -b -q -k");
    });
});