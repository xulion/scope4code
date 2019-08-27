import {run_command} from '../run_command';
const child_process = require('child_process');

jest.mock("child_process");

let child_instance = null;

describe('listFilesInDirectorySync', () => {
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
        let result = await run_command("adb");

        expect(child_process.spawn).toBeCalledWith("adb", undefined, undefined);
        expect(child_instance.stdout.on).toBeCalledTimes(0);
        expect(child_instance.stderr.on).toBeCalledTimes(0);
        expect(result.success).toBe(false);
    });

    test('run a single command with no param', async () => {

        init_spawn_mock(true, ["1231323", "abababab"], null, 0);

        const result = await run_command("adb");

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
        const result = await run_command("1234", ["arg1"]);
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
        const result = await run_command("1234", ["arg1", "arg2", "arg3"]);
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

        const result = await run_command("1234", ["arg1"], {cwd:"1234"});
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
        
        const result = await run_command("1234", ["arg1"], {cwd:"1234", env:"ABC"});
        expect(child_process.spawn).toBeCalledWith("1234", ["arg1"], {env:"ABC", cwd:"1234"});
        expect(child_instance.stdout.on).toBeCalledWith("data", expect.anything());
        expect(child_instance.stderr.on).toBeCalledWith("data", expect.anything());
        expect(result.stdout).toBe("");
        expect(result.stderr).toBe("error code 5");
        expect(result.success).toBe(true);
        expect(result.code).toBe(5);
    });
});
