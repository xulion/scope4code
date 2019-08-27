'use strict';
const child_process = require('child_process');
const os = require('os');

jest.mock("child_process");
jest.mock("os");

let child_instance = null;

describe('run command tests', () => {
    const utilities = require('../utilities');

    beforeEach(() => {
        child_instance = {
            stdout : {
                on : jest.fn()
            },
            stderr : {
                on : jest.fn()
            },
            on : jest.fn()
        };
    });

    function init_spawn_mock(success:boolean, stdout_val:string[], stderr_val:string[], return_code:number) {

        if (success) {
            child_process.spawn.mockReturnValueOnce(child_instance);
            if (stdout_val) {
                child_instance.stdout.on.mockImplementation((data, callback)=>{
                    setTimeout(()=>{
                        stdout_val.forEach(element => {
                            callback(Buffer.from(element));
                        });    
                    }, 1);
                });
            }

            if (stderr_val) {
                child_instance.stderr.on.mockImplementation((data, callback)=>{
                    setTimeout(()=>{
                        stderr_val.forEach(element => {
                            callback(Buffer.from(element));
                        });    
                    }, 1);
                });
            }

            child_instance.on.mockImplementation((data, callback)=>{
                if (data === "close") {
                    setTimeout(()=>{
                        callback(return_code);
                    }, 1);
                }
            });
        }
        else {
            child_process.spawn.mockImplementation(()=>{
                throw ("error");
            });
        }
    }
  
    test('failed to run a command', async () => {

        init_spawn_mock(false, null, null, 0);
        let result = await utilities.run_command("adb");

        expect(child_process.spawn).toBeCalledWith("adb", undefined, undefined);
        expect(child_instance.stdout.on).toBeCalledTimes(0);
        expect(child_instance.stderr.on).toBeCalledTimes(0);
        expect(result.success).toBe(false);
    });

    test('run a single command with no param', async () => {

        init_spawn_mock(true, ["1231323", "abababab"], null, 0);

        const result = await utilities.run_command("adb");

        expect(child_process.spawn).toBeCalledWith("adb", undefined, undefined);
        expect(child_instance.stdout.on).toBeCalledWith("data", expect.anything());
        expect(child_instance.stderr.on).toBeCalledWith("data", expect.anything());
        expect(result.stdout).toBe("1231323abababab");
        expect(result.stderr).toBe("");
        expect(result.success).toBe(true);
        expect(result.code).toBe(0);
    });

    test('run a single command with one arg', async () => {
        init_spawn_mock(true, ["success"], null, 0);
        const result = await utilities.run_command("1234", ["arg1"]);
        expect(child_process.spawn).toBeCalledWith("1234", ["arg1"], undefined);
        expect(child_instance.stdout.on).toBeCalledWith("data", expect.anything());
        expect(child_instance.stderr.on).toBeCalledWith("data", expect.anything());
        expect(result.stdout).toBe("success");
        expect(result.stderr).toBe("");
        expect(result.success).toBe(true);
        expect(result.code).toBe(0);
    });

    test('run a single command with more args', async () => {
        init_spawn_mock(true, ["success with more args"], null, 0);
        const result = await utilities.run_command("1234", ["arg1", "arg2", "arg3"]);
        expect(child_process.spawn).toBeCalledWith("1234", ["arg1", "arg2", "arg3"], undefined);
        expect(child_instance.stdout.on).toBeCalledWith("data", expect.anything());
        expect(child_instance.stderr.on).toBeCalledWith("data", expect.anything());
        expect(result.stdout).toBe("success with more args");
        expect(result.stderr).toBe("");
        expect(result.success).toBe(true);
        expect(result.code).toBe(0);
    });

    test('run a single command with option', async () => {
        init_spawn_mock(true, null, ["error", " code 11"], 0);

        const result = await utilities.run_command("1234", ["arg1"], {cwd:"1234"});
        expect(child_process.spawn).toBeCalledWith("1234", ["arg1"], {cwd:"1234"});
        expect(child_instance.stdout.on).toBeCalledWith("data", expect.anything());
        expect(child_instance.stderr.on).toBeCalledWith("data", expect.anything());
        expect(result.stdout).toBe("");
        expect(result.stderr).toBe("error code 11");
        expect(result.success).toBe(true);
        expect(result.code).toBe(0);
    });

    test('run a single command with option has multiple fields and failed', async () => {
        init_spawn_mock(true, null, ["error", " code 5"], 5);
        
        const result = await utilities.run_command("1234", ["arg1"], {cwd:"1234", env:"ABC"});
        expect(child_process.spawn).toBeCalledWith("1234", ["arg1"], {env:"ABC", cwd:"1234"});
        expect(child_instance.stdout.on).toBeCalledWith("data", expect.anything());
        expect(child_instance.stderr.on).toBeCalledWith("data", expect.anything());
        expect(result.stdout).toBe("");
        expect(result.stderr).toBe("error code 5");
        expect(result.success).toBe(true);
        expect(result.code).toBe(5);
    });
});

describe('current os test', () => {
    const utilities = require('../utilities');

    function test_current_os (os_string : string, os_type : number) {
        os.platform.mockReturnValueOnce(os_string);

        const returned_os_type = utilities.current_os();
        expect(returned_os_type).toBe(os_type);
        expect(os.platform).toBeCalledTimes(1);
    }
    
    test('return unkown for aix', () => {
        test_current_os("aix", utilities.constants.OS_UNKOWN);
    });

    test('return unkown for freebsd', () => {
        test_current_os("freebsd", utilities.constants.OS_UNKOWN);
    });

    test('return unkown for openbsd', () => {
        test_current_os("openbsd", utilities.constants.OS_UNKOWN);
    });

    test('return unkown for sunos', () => {
        test_current_os("sunos", utilities.constants.OS_UNKOWN);
    });

    test('return unkown for android', () => {
        test_current_os("android", utilities.constants.OS_UNKOWN);
    });

    test('return linux for linux', () => {
        test_current_os("linux", utilities.constants.OS_LINUX);
    });

    test('return windows for win32', () => {
        test_current_os("win32", utilities.constants.OS_WINDOWS);
    });

    test('return Mac for darwin', () => {
        test_current_os("darwin", utilities.constants.OS_MAC_OS);
    });
});
