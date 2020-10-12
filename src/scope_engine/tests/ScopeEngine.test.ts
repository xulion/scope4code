'use strict';
import {cmd_result, config_variable_str} from '../../util/scope4code_def';

const fs = require('fs');
jest.mock("fs");

const path = require('path');
jest.mock("path");

const utilities = require('../../util/utilities');
jest.mock("../../util/utilities");

const cmd_builder = require('../../cmd_builder/cmd_builder');
jest.mock("../../cmd_builder/cmd_builder");

import ScopeEngine from '../ScopeEngine';

describe('ScopeEngine test', () => {

    const cmdGenInterface = {
        listFileCmd : jest.fn(),
        buildDatabaseCmd : jest.fn(),
        findAllRefCmd : jest.fn(),
        findDefineCmd : jest.fn(),
        findCalleeCmd : jest.fn(),
        findCallerCmd : jest.fn(),
        findTextCmd : jest.fn()
    };

    function setupRunCmdMock(run_cmd_returns : cmd_result) {
        cmd_builder.build.mockReturnValueOnce(cmdGenInterface);
        utilities.run_command.mockReturnValue(run_cmd_returns);
    }

    function verifyCmdResult(result : boolean, cmd : string, cmd_param : string[], cmd_option? : any) {
        expect(result).toBe(result);
        expect(utilities.run_command).toBeCalledTimes(1);
        if (cmd_option === undefined) {
            expect(utilities.run_command).toBeCalledWith(cmd, cmd_param);
        }
        else {
            expect(utilities.run_command).toBeCalledWith(cmd, cmd_param, cmd_option);
        }
    }

    //-------------------------------------------------------------------
    //tests for function runCmdWithText
    test('run cmd with no param', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "abcd", stderr : ""});

        const engine = new ScopeEngine(undefined, undefined, undefined, null);

        const result = await engine.runCmdWithText("cmd");

        expect(result).toBe(true);
        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", []);

        const std_out = engine.getStdOut();
        expect(std_out).toBe("abcd");

    });

    test('run cmd with failure', async () => {
        setupRunCmdMock({success : false, code : 0, stdout : "", stderr : "error"});
        const engine = new ScopeEngine(undefined, undefined, undefined, null);

        const result = await engine.runCmdWithText("cmd");

        verifyCmdResult(false, "cmd", []);

        const std_out = engine.getStdOut();
        expect(std_out).toBe("");

        const std_err = engine.getStdErr();
        expect(std_err).toBe("error");
    });

    test('run cmd with failure (return non-zero code)', async () => {
        setupRunCmdMock({success : true, code : 1, stdout : "", stderr : "error code 1"});
        const engine = new ScopeEngine(undefined, undefined, undefined, null);

        const result = await engine.runCmdWithText("cmd");

        verifyCmdResult(false, "cmd", []);

        const std_out = engine.getStdOut();
        expect(std_out).toBe("");

        const std_err = engine.getStdErr();
        expect(std_err).toBe("error code 1");
    });

    test('run cmd with exe path and no param', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});
        const engine = new ScopeEngine(undefined, "mypath", undefined, null);

        const result = await engine.runCmdWithText("cmd");

        expect(result).toBe(true);
        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", [], {cwd:"mypath"});
    });

    test('run cmd with exe path and one param', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});
        const engine = new ScopeEngine(undefined, "/mypath/subpath", undefined, null);

        const result = await engine.runCmdWithText("cmd p1");

        expect(result).toBe(true);
        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", ["p1"], {cwd :  "/mypath/subpath"});
    });

    test('run cmd with exe path and many param', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});
        const engine = new ScopeEngine(undefined, "c:\\mypath", undefined, null);

        const result = await engine.runCmdWithText("cmd p1 p2 p3 p4 p5");

        expect(result).toBe(true);
        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", ["p1", "p2", "p3", "p4", "p5"], {cwd:"c:\\mypath"});
    });

    test('run cmd with one param', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});
        const engine = new ScopeEngine(undefined, undefined, undefined, null);

        const result = await engine.runCmdWithText("cmd p1");

        expect(result).toBe(true);
        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", ["p1"]);
    });

    test('run cmd with mulitple param and variant spaces', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});
        const engine = new ScopeEngine(undefined, undefined, undefined, null);

        //parameters are split by spaces and tabs
        const result = await engine.runCmdWithText("cmd p1  p2	p3    p4	p5");

        expect(result).toBe(true);
        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", ["p1", "p2", "p3", "p4", "p5"]);
    });

    //-------------------------------------------------------------------
    //tests for generating file list
    test('generate file list', async () => {
        path.join.mockReturnValueOnce("c:\\abc\\cscope.files");
        setupRunCmdMock({success : true, code : 0, stdout : "file1.c\nfile2.c", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "c:\\abc", undefined, null);

        cmdGenInterface.listFileCmd.mockReturnValueOnce("cmd ${src_path} p2 p3");
        const result = await engine.generateFileList();

        expect(result).toBe(true);

        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", ["folder1", "p2", "p3"], {cwd : "c:\\abc"});

        expect(path.join).toBeCalledTimes(1);
        expect(path.join).toBeCalledWith("c:\\abc", "cscope.files");
        expect(fs.writeFileSync).toBeCalledTimes(1);
        expect(fs.writeFileSync).toBeCalledWith("c:\\abc\\cscope.files", "file1.c\nfile2.c");
    });

    test('generate file list fail', async () => {
        setupRunCmdMock({success : false, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], undefined, undefined, null);

        cmdGenInterface.listFileCmd.mockReturnValueOnce("cmd ${src_path} p2 p3");
        const result = await engine.generateFileList();

        expect(result).toBe(false);

        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", ["folder1", "p2", "p3"]);

        expect(fs.writeFileSync).toBeCalledTimes(0);
    });

    test('generate file list with multiple param refer to source path', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["/folder2"], "/cscope_abc", undefined, null);

        cmdGenInterface.listFileCmd.mockReturnValueOnce("cmd ${src_path} p2 p3    ${src_path}");
        const result = await engine.generateFileList();

        expect(result).toBe(true);

        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", ["/folder2", "p2", "p3", "/folder2"], {cwd : "/cscope_abc"});
    });

    test('generate file list for multiple source folders', async () => {
        setupRunCmdMock({success : true,
            code : 0,
            stdout : "file1.c\n",
            stderr : ""});

        path.join.mockReturnValueOnce("/cscope_abc/cscope.files");

        const engine = new ScopeEngine(["/folder1", "/folder2", "folder3"], "/cscope_abc", undefined, null);

        cmdGenInterface.listFileCmd.mockReturnValue("cmd ${src_path} p2 p3    ${src_path}");
        const result = await engine.generateFileList();

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

    test('generate file list for multiple source folders with excluded paths', async () => {
        setupRunCmdMock({success : true,
            code : 0,
            stdout : "file1.c\n/abc/1.c\n/exclude/a.c\n",
            stderr : ""});

        path.join.mockReturnValueOnce("/cscope_abc/cscope.files");

        const engine = new ScopeEngine(["/folder1", "/folder2", "folder3"], "/cscope_abc", undefined, null);

        cmdGenInterface.listFileCmd.mockReturnValue("cmd ${src_path} p2 p3    ${src_path}");
        const result = await engine.generateFileList(["/exclude/.*"]);

        expect(result).toBe(true);

        expect(utilities.run_command).toBeCalledTimes(3);
        expect(utilities.run_command).toBeCalledWith("cmd", ["/folder1", "p2", "p3", "/folder1"], {cwd : "/cscope_abc"});
        expect(utilities.run_command).toBeCalledWith("cmd", ["/folder2", "p2", "p3", "/folder2"], {cwd : "/cscope_abc"});
        expect(utilities.run_command).toBeCalledWith("cmd", ["folder3", "p2", "p3", "folder3"], {cwd : "/cscope_abc"});

        expect(path.join).toBeCalledTimes(1);
        expect(path.join).toBeCalledWith("/cscope_abc", "cscope.files");

        expect(fs.writeFileSync).toBeCalledTimes(1);
        expect(fs.writeFileSync).toBeCalledWith("/cscope_abc/cscope.files", "file1.c\n/abc/1.c\nfile1.c\n/abc/1.c\nfile1.c\n/abc/1.c\n");
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

        const engine = new ScopeEngine(["/folder1", "/folder2", "folder3"], undefined, undefined, null);

        cmdGenInterface.listFileCmd.mockReturnValue("cmd ${src_path} p2 p3    ${src_path}");
        const result = await engine.generateFileList();

        expect(result).toBe(false);

        expect(utilities.run_command).toBeCalledTimes(2);
        expect(utilities.run_command).toBeCalledWith("cmd", ["/folder1", "p2", "p3", "/folder1"]);
        expect(utilities.run_command).toBeCalledWith("cmd", ["/folder2", "p2", "p3", "/folder2"]);

        expect(fs.writeFileSync).toBeCalledTimes(0);
    });

    //-------------------------------------------------------------------
    //tests for building database
    test('build database', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);

        cmdGenInterface.buildDatabaseCmd.mockReturnValueOnce("cmd build database");
        const result = await engine.buildDatabase();

        verifyCmdResult(true, "cmd", ["build", "database"], {cwd : "/cscope_abc"});
    });

    test('build database command has special path', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);

        cmdGenInterface.buildDatabaseCmd.mockReturnValueOnce("cmd build database ${database_path}/databasefile");
        const result = await engine.buildDatabase();

        expect(result).toBe(true);

        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", ["build", "database", "/cscope_abc/databasefile"], {cwd : "/cscope_abc"});
    });

    test('build database fail', async () => {
        setupRunCmdMock({success : false, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);

        cmdGenInterface.buildDatabaseCmd.mockReturnValueOnce("cmd build database");
        const result = await engine.buildDatabase();

        expect(result).toBe(false);

        expect(utilities.run_command).toBeCalledTimes(1);
        expect(utilities.run_command).toBeCalledWith("cmd", ["build", "database"], {cwd : "/cscope_abc"});
    });

    //-------------------------------------------------------------------
    //tests search reference command
    test('search reference', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);

        cmdGenInterface.findAllRefCmd.mockReturnValueOnce("cmd find ref of ${text}");
        const result = await engine.searchRef("abc");

        verifyCmdResult(true, "cmd", ["find", "ref", "of", "abc"], {cwd : "/cscope_abc"});
    });

    test('search reference fail', async () => {
        setupRunCmdMock({success : false, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);

        cmdGenInterface.findAllRefCmd.mockReturnValueOnce("cmd find ref of ${text}");
        const result = await engine.searchRef("abc");

        verifyCmdResult(false, "cmd", ["find", "ref", "of", "abc"], {cwd : "/cscope_abc"});
    });

    test('search reference with text has special char', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});
        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);

        cmdGenInterface.findAllRefCmd.mockReturnValueOnce("cmd find ref of${text}");
        const result = await engine.searchRef("{abc}");

        verifyCmdResult(true, "cmd", ["find", "ref", "of{abc}"], {cwd : "/cscope_abc"});
    });

    test('search reference with text appeared in multiple places', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});
        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);

        cmdGenInterface.findAllRefCmd.mockReturnValueOnce("cmd find ref of${text} and ${text}");
        const result = await engine.searchRef("{abc}");

        verifyCmdResult(true, "cmd", ["find", "ref", "of{abc}", "and", "{abc}"], {cwd : "/cscope_abc"});
    });

    test('search reference with text appeared in multiple places', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findAllRefCmd.mockReturnValueOnce("cmd find ref of${text} and ${text}");
        const result = await engine.searchRef("{abc}");

        verifyCmdResult(true, "cmd", ["find", "ref", "of{abc}", "and", "{abc}"], {cwd : "/cscope_abc"});
    });

    test('search reference with text appeared in multiple places and with database path', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findAllRefCmd.mockReturnValueOnce("cmd find ref of${text} and ${text} using ${database_path}/databasefile");
        const result = await engine.searchRef("{abc}");

        verifyCmdResult(true, "cmd", ["find", "ref", "of{abc}", "and", "{abc}", "using", "/cscope_abc/databasefile"], {cwd : "/cscope_abc"});
    });

    //-------------------------------------------------------------------
    //tests search definition command
    test('search definition', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findDefineCmd.mockReturnValueOnce("cmd find definition of ${text}");
        const result = await engine.searchDefinition("abc");

        verifyCmdResult(true, "cmd", ["find", "definition", "of", "abc"], {cwd : "/cscope_abc"});
    });

    test('search definition fail', async () => {
        setupRunCmdMock({success : false, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findDefineCmd.mockReturnValueOnce("cmd find definition of ${text}");
        const result = await engine.searchDefinition("abc");

        verifyCmdResult(true, "cmd", ["find", "definition", "of", "abc"], {cwd : "/cscope_abc"});
    });

    test('search reference with text has special char', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findDefineCmd.mockReturnValueOnce("cmd find definition of${text}");
        const result = await engine.searchDefinition("{abc}");

        verifyCmdResult(true, "cmd", ["find", "definition", "of{abc}"], {cwd : "/cscope_abc"});
    });

    test('search reference with text appeared in multiple places', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findDefineCmd.mockReturnValueOnce("cmd find definition of${text} and ${text}");
        const result = await engine.searchDefinition("{abc}");

        verifyCmdResult(true, "cmd", ["find", "definition", "of{abc}", "and", "{abc}"], {cwd : "/cscope_abc"});
    });

    test('search reference with text appeared in multiple places', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findDefineCmd.mockReturnValueOnce("cmd find definition of${text} and ${text}");
        const result = await engine.searchDefinition("{abc}");

        verifyCmdResult(true, "cmd", ["find", "definition", "of{abc}", "and", "{abc}"], {cwd : "/cscope_abc"});
    });

    test('search reference with text appeared in multiple places and with database path', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findDefineCmd.mockReturnValueOnce("cmd find definition of${text} and ${text} using ${database_path}/databasefile");
        const result = await engine.searchDefinition("{abc}");

        verifyCmdResult(true, "cmd", ["find", "definition", "of{abc}", "and", "{abc}", "using", "/cscope_abc/databasefile"], {cwd : "/cscope_abc"});
    });

    //-------------------------------------------------------------------
    //tests search callee command
    test('search callee', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findCalleeCmd.mockReturnValueOnce("cmd find callee of ${text}");
        const result = await engine.searchCallee("function_abc");

        verifyCmdResult(true, "cmd", ["find", "callee", "of", "function_abc"], {cwd : "/cscope_abc"});
    });

    test('search callee fail', async () => {
        setupRunCmdMock({success : false, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findCalleeCmd.mockReturnValueOnce("cmd find callee of ${text}");
        const result = await engine.searchCallee("function_abc");

        verifyCmdResult(false, "cmd", ["find", "callee", "of", "function_abc"], {cwd : "/cscope_abc"});
    });

    test('search callee with text has special char', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findCalleeCmd.mockReturnValueOnce("cmd find callee of${text}");
        const result = await engine.searchCallee("{abc}");

        verifyCmdResult(true, "cmd", ["find", "callee", "of{abc}"], {cwd : "/cscope_abc"});
    });

    test('search callee with text appeared in multiple places', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findCalleeCmd.mockReturnValueOnce("cmd find callee of${text} and ${text}");
        const result = await engine.searchCallee("{abc}");

        verifyCmdResult(true, "cmd", ["find", "callee", "of{abc}", "and", "{abc}"], {cwd : "/cscope_abc"});
    });

    test('search callee with text appeared in multiple places', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findCalleeCmd.mockReturnValueOnce("cmd find callee of${text} and ${text}");
        const result = await engine.searchCallee("{abc}");

        verifyCmdResult(true, "cmd", ["find", "callee", "of{abc}", "and", "{abc}"], {cwd : "/cscope_abc"});
    });

    test('search callee with text appeared in multiple places and with database path', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findCalleeCmd.mockReturnValueOnce("cmd find callee of${text} and ${text} using ${database_path}/databasefile");
        const result = await engine.searchCallee("{abc}");

        verifyCmdResult(true, "cmd", ["find", "callee", "of{abc}", "and", "{abc}", "using", "/cscope_abc/databasefile"], {cwd : "/cscope_abc"});
    });

    //-------------------------------------------------------------------
    //tests search caller command
    test('search caller', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findCallerCmd.mockReturnValueOnce("cmd find caller of ${text}");
        const result = await engine.searchCaller("function_abc");

        verifyCmdResult(true, "cmd", ["find", "caller", "of", "function_abc"], {cwd : "/cscope_abc"});
    });

    test('search caller fail', async () => {
        setupRunCmdMock({success : false, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findCallerCmd.mockReturnValueOnce("cmd find caller of ${text}");
        const result = await engine.searchCaller("function_abc");

        verifyCmdResult(false, "cmd", ["find", "caller", "of", "function_abc"], {cwd : "/cscope_abc"});
    });

    test('search caller with text has special char', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findCallerCmd.mockReturnValueOnce("cmd find caller of${text}");
        const result = await engine.searchCaller("{abc}");

        verifyCmdResult(true, "cmd", ["find", "caller", "of{abc}"], {cwd : "/cscope_abc"});
    });

    test('search caller with text appeared in multiple places', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findCallerCmd.mockReturnValueOnce("cmd find caller of${text} and ${text}");
        const result = await engine.searchCaller("{abc}");

        verifyCmdResult(true, "cmd", ["find", "caller", "of{abc}", "and", "{abc}"], {cwd : "/cscope_abc"});
    });

    test('search caller with text appeared in multiple places', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findCallerCmd.mockReturnValueOnce("cmd find caller of${text} and ${text}");
        const result = await engine.searchCaller("{abc}");

        verifyCmdResult(true, "cmd", ["find", "caller", "of{abc}", "and", "{abc}"], {cwd : "/cscope_abc"});
    });

    test('search caller with text appeared in multiple places and with database path', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findCallerCmd.mockReturnValueOnce("cmd find caller of${text} and ${text} using ${database_path}/databasefile");
        const result = await engine.searchCaller("{abc}");

        verifyCmdResult(true, "cmd", ["find", "caller", "of{abc}", "and", "{abc}", "using", "/cscope_abc/databasefile"], {cwd : "/cscope_abc"});
    });

    //-------------------------------------------------------------------
    //tests search text command
    test('search text', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findTextCmd.mockReturnValueOnce("cmd find text of ${text}");
        const result = await engine.searchText("function abc");

        verifyCmdResult(true, "cmd", ["find", "text", "of", "function abc"], {cwd : "/cscope_abc"});
    });

    test('search text fail', async () => {
        setupRunCmdMock({success : false, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findTextCmd.mockReturnValueOnce("cmd find text of ${text}");
        const result = await engine.searchText("function_abc");

        verifyCmdResult(false, "cmd", ["find", "text", "of", "function_abc"], {cwd : "/cscope_abc"});
    });

    test('search text with text has special char', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findTextCmd.mockReturnValueOnce("cmd find text of${text}");
        const result = await engine.searchText("{abc}");

        verifyCmdResult(true, "cmd", ["find", "text", "of{abc}"], {cwd : "/cscope_abc"});
    });

    test('search text with text appeared in multiple places', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findTextCmd.mockReturnValueOnce("cmd find text of${text} and ${text}");
        const result = await engine.searchText("{abc}");

        verifyCmdResult(true, "cmd", ["find", "text", "of{abc}", "and", "{abc}"], {cwd : "/cscope_abc"});
    });

    test('search text with text appeared in multiple places', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findTextCmd.mockReturnValueOnce("cmd find text of${text} and ${text}");
        const result = await engine.searchText("{abc}");

        verifyCmdResult(true, "cmd", ["find", "text", "of{abc}", "and", "{abc}"], {cwd : "/cscope_abc"});
    });

    test('search text with text appeared in multiple places and with database path', async () => {
        setupRunCmdMock({success : true, code : 0, stdout : "", stderr : ""});

        const engine = new ScopeEngine(["folder1"], "/cscope_abc", undefined, null);
        cmdGenInterface.findTextCmd.mockReturnValueOnce("cmd find text of${text} and ${text} using ${database_path}/databasefile");
        const result = await engine.searchText("{abc}");

        verifyCmdResult(true, "cmd", ["find", "text", "of{abc}", "and", "{abc}", "using", "/cscope_abc/databasefile"], {cwd : "/cscope_abc"});
    });
});