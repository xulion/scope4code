'use strict';

describe('ScopeEngine test', () => {
    const fs = require('fs');
    jest.mock("fs");
    
    const path = require('path');
    jest.mock("path");

    const utilities = require('../../util/utilities');
    jest.mock("../../util/utilities");

    const cmd_builder = require('../../cmd_runner/cmd_builder');
    jest.mock("../../cmd_runner/cmd_builder");

    const ScopeEngine = require('../ScopeEngine');

    const cmdGenInterface = {
        list_file_cmd : jest.fn(),
        build_database_cmd : jest.fn()
    };

    //-------------------------------------------------------------------
    //tests for function run_cmd_with_text
    test('run cmd with no param', async () => {
        cmd_builder.build.mockReturnValueOnce(cmdGenInterface);
        const engine = new ScopeEngine;

        utilities.run_command.mockReturnValue({success : true, code : 0, stdout : "abcd", stderr : ""});

        const result = await engine.run_cmd_with_text("cmd");

        expect(result).toBe(true);
        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", []);

        const std_out = engine.get_std_out();
        expect(std_out).toBe("abcd");

    });

    test('run cmd with failure', async () => {
        cmd_builder.build.mockReturnValueOnce(cmdGenInterface);
        const engine = new ScopeEngine;

        utilities.run_command.mockReturnValue({success : false, code : 0, stdout : "", stderr : "error"});

        const result = await engine.run_cmd_with_text("cmd");

        expect(result).toBe(false);
        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", []);

        const std_out = engine.get_std_out();
        expect(std_out).toBe("");

        const std_err = engine.get_std_err();
        expect(std_err).toBe("error");
    });

    test('run cmd with failure (return non-zero code)', async () => {
        cmd_builder.build.mockReturnValueOnce(cmdGenInterface);
        const engine = new ScopeEngine;

        utilities.run_command.mockReturnValue({success : true, code : 1, stdout : "", stderr : "error code 1"});

        const result = await engine.run_cmd_with_text("cmd");

        expect(result).toBe(false);
        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", []);

        const std_out = engine.get_std_out();
        expect(std_out).toBe("");

        const std_err = engine.get_std_err();
        expect(std_err).toBe("error code 1");
    });

    test('run cmd with exe path and no param', async () => {
        cmd_builder.build.mockReturnValueOnce(cmdGenInterface);
        const engine = new ScopeEngine;

        utilities.run_command.mockReturnValue({success : true, code : 0, stdout : "", stderr : ""});

        const result = await engine.run_cmd_with_text("cmd", "mypath");

        expect(result).toBe(true);
        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", [], {cwd:"mypath"});
    });

    test('run cmd with exe path and one param', async () => {
        cmd_builder.build.mockReturnValueOnce(cmdGenInterface);
        const engine = new ScopeEngine;

        utilities.run_command.mockReturnValue({success : true, code : 0, stdout : "", stderr : ""});

        const result = await engine.run_cmd_with_text("cmd p1", "/mypath/subpath");

        expect(result).toBe(true);
        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", ["p1"], {cwd:"/mypath/subpath"});
    });

    test('run cmd with exe path and many param', async () => {
        cmd_builder.build.mockReturnValueOnce(cmdGenInterface);
        const engine = new ScopeEngine;

        utilities.run_command.mockReturnValue({success : true, code : 0, stdout : "", stderr : ""});

        const result = await engine.run_cmd_with_text("cmd p1 p2 p3 p4 p5", "c:\\mypath");

        expect(result).toBe(true);
        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", ["p1", "p2", "p3", "p4", "p5"], {cwd:"c:\\mypath"});
    });

    test('run cmd with one param', async () => {
        cmd_builder.build.mockReturnValueOnce(cmdGenInterface);
        const engine = new ScopeEngine;

        utilities.run_command.mockReturnValue({success : true, code : 0, stdout : "", stderr : ""});

        const result = await engine.run_cmd_with_text("cmd p1");

        expect(result).toBe(true);
        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", ["p1"]);
    });

    test('run cmd with mulitple param and variant spaces', async () => {
        cmd_builder.build.mockReturnValueOnce(cmdGenInterface);
        const engine = new ScopeEngine;

        utilities.run_command.mockReturnValue({success : true, code : 0, stdout : "", stderr : ""});

        //parameters are split by spaces and tabs
        const result = await engine.run_cmd_with_text("cmd p1  p2	p3    p4	p5");

        expect(result).toBe(true);
        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", ["p1", "p2", "p3", "p4", "p5"]);
    });

    //-------------------------------------------------------------------
    //tests for generating file list
    test('generate file list', async () => {
        path.join.mockReturnValueOnce("c:\\abc\\cscope.files");
        cmd_builder.build.mockReturnValueOnce(cmdGenInterface);
        utilities.run_command.mockReturnValue({success : true, code : 0, stdout : "file1.c\nfile2.c", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "c:\\abc");

        cmdGenInterface.list_file_cmd.mockReturnValueOnce("cmd ${src_path} p2 p3");
        const result = await engine.generate_file_list();

        expect(result).toBe(true);

        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", ["folder1", "p2", "p3"], {cwd : "c:\\abc"});

        expect(path.join).toBeCalledTimes(1);
        expect(path.join).toBeCalledWith("c:\\abc", "cscope.files");
        expect(fs.writeFileSync).toBeCalledTimes(1);
        expect(fs.writeFileSync).toBeCalledWith("c:\\abc\\cscope.files", "file1.c\nfile2.c");
    });

    test('generate file list fail', async () => {
        cmd_builder.build.mockReturnValueOnce(cmdGenInterface);
        utilities.run_command.mockReturnValue({success : false, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"]);

        cmdGenInterface.list_file_cmd.mockReturnValueOnce("cmd ${src_path} p2 p3");
        const result = await engine.generate_file_list();

        expect(result).toBe(false);

        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", ["folder1", "p2", "p3"]);

        expect(fs.writeFileSync).toBeCalledTimes(0);
    });

    test('generate file list with multiple param refer to source path', async () => {
        cmd_builder.build.mockReturnValueOnce(cmdGenInterface);
        utilities.run_command.mockReturnValue({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["/folder2"], "/cscope_abc");

        cmdGenInterface.list_file_cmd.mockReturnValueOnce("cmd ${src_path} p2 p3    ${src_path}");
        const result = await engine.generate_file_list();

        expect(result).toBe(true);

        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", ["/folder2", "p2", "p3", "/folder2"], {cwd : "/cscope_abc"});
    });

    test('generate file list for multiple source folders', async () => {
        cmd_builder.build.mockReturnValueOnce(cmdGenInterface);
        path.join.mockReturnValueOnce("/cscope_abc/cscope.files");
        utilities.run_command.mockReturnValue({success : true,
                                                code : 0,
                                                stdout : "file1.c\n",
                                                stderr : ""});

        const engine = new ScopeEngine(["/folder1", "/folder2", "folder3"], "/cscope_abc");

        cmdGenInterface.list_file_cmd.mockReturnValue("cmd ${src_path} p2 p3    ${src_path}");
        const result = await engine.generate_file_list();

        expect(result).toBe(true);

        expect(utilities.run_command).toBeCalledTimes(3);
        expect(utilities.run_command).toBeCalledWith("cmd", ["/folder1", "p2", "p3", "/folder1"], {cwd : "/cscope_abc"});
        expect(utilities.run_command).toBeCalledWith("cmd", ["/folder2", "p2", "p3", "/folder2"], {cwd : "/cscope_abc"});
        expect(utilities.run_command).toBeCalledWith("cmd", ["folder3", "p2", "p3", "folder3"], {cwd : "/cscope_abc"});

        expect(path.join).toBeCalledTimes(1);
        expect(path.join).toBeCalledWith("/cscope_abc", "cscope.files");

        expect(fs.writeFileSync).toBeCalledTimes(1);
        expect(fs.writeFileSync).toBeCalledWith("/cscope_abc/cscope.files", "file1.c\nfile1.c\nfile1.c\n");
    });

    test('generate file list for multiple source folders then fail in the middle', async () => {
        cmd_builder.build.mockReturnValueOnce(cmdGenInterface);
        utilities.run_command.mockReturnValueOnce({success : true,
                                                code : 0,
                                                stdout : "12313",
                                                stderr : ""});
        utilities.run_command.mockReturnValueOnce({success : false,
                                                code : 0,
                                                stdout : "",
                                                stderr : ""});

        const engine = new ScopeEngine(["/folder1", "/folder2", "folder3"]);

        cmdGenInterface.list_file_cmd.mockReturnValue("cmd ${src_path} p2 p3    ${src_path}");
        const result = await engine.generate_file_list();

        expect(result).toBe(false);

        expect(utilities.run_command).toBeCalledTimes(2);
        expect(utilities.run_command).toBeCalledWith("cmd", ["/folder1", "p2", "p3", "/folder1"]);
        expect(utilities.run_command).toBeCalledWith("cmd", ["/folder2", "p2", "p3", "/folder2"]);

        expect(fs.writeFileSync).toBeCalledTimes(0);
    });

    //-------------------------------------------------------------------
    //tests for building database
    test('build database', async () => {
        cmd_builder.build.mockReturnValueOnce(cmdGenInterface);
        utilities.run_command.mockReturnValue({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc");

        cmdGenInterface.build_database_cmd.mockReturnValueOnce("cmd build database");
        const result = await engine.build_database();

        expect(result).toBe(true);

        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", ["build", "database"], {cwd : "/cscope_abc"});
    });

});