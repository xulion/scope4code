'use strict';

const fs = require('fs');
jest.mock("fs");
import ExtensionConfig from "../ExtensionConfig";

describe('ExtensionConfig tests', () => {

    const workspace_config_mock = {
        has : jest.fn(),
        get : jest.fn(),
        inspect : jest.fn(),
        update : jest.fn()
    }

    afterEach(() => {
        jest.resetAllMocks();
    });

    /////////////////////////////////////////////////////////////////////////////
    // test helper functions 
    /////////////////////////////////////////////////////////////////////////////
    function enableExtention(enable_ext : boolean) : void {
        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce(enable_ext);
    }


    /////////////////////////////////////////////////////////////////////////////
    // test cases 
    /////////////////////////////////////////////////////////////////////////////
    test('Configured with nothing configured', async () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");

        const extention_enabled = engine_config.enabled();
        expect(extention_enabled).toStrictEqual(true);

        const exe_path = engine_config.getExePath();
        expect(exe_path).toStrictEqual("");

        const database_path = engine_config.getDatabasePath();
        expect(database_path).toStrictEqual("/workspace/.vscode/cscope");

        const open_in_new_col = engine_config.openInNewCol();
        expect(open_in_new_col).toStrictEqual(false);

        let engine_cmd_cfg = engine_config.getEngineCmdStrings();
        expect(engine_cmd_cfg).toStrictEqual(null);

        const print_cmd = engine_config.getPrintCmd();
        expect(print_cmd).toStrictEqual(false);

        const src_paths = engine_config.getSourcePaths();
        expect(src_paths).toStrictEqual(["/workspace"]);
    });

    test('Configured to be disabled', async () => {

        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");

        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce(false);
        const extention_enabled = engine_config.enabled();
        expect(extention_enabled).toStrictEqual(false);
        expect(workspace_config_mock.has).toBeCalledWith("enableScope");
        expect(workspace_config_mock.get).toBeCalledWith("enableScope");
    });

    test('Configured to be enabled', async () => {

        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");

        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce(true);
        const extention_enabled = engine_config.enabled();
        expect(extention_enabled).toStrictEqual(true);
        expect(workspace_config_mock.has).toBeCalledWith("enableScope");
        expect(workspace_config_mock.get).toBeCalledWith("enableScope");
    });

    test('executable path is configured as null', async () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");

        enableExtention(true);

        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce("");
        const exe_path = engine_config.getExePath();
        expect(exe_path).toStrictEqual("");
        expect(workspace_config_mock.has).toBeCalledWith("executablePath");
        expect(workspace_config_mock.get).toBeCalledWith("executablePath");
    });

    test('Configured with executable path', async () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");

        enableExtention(true);
        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce("/cscope_path");
        let exe_path = engine_config.getExePath();
        expect(exe_path).toStrictEqual("/cscope_path");

        expect(workspace_config_mock.has).toBeCalledWith("executablePath");
        expect(workspace_config_mock.get).toBeCalledWith("executablePath");

        enableExtention(true);
        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce("${workspaceRoot}/cscope_path");
        exe_path = engine_config.getExePath();
        expect(exe_path).toStrictEqual("/workspace/cscope_path");

        expect(workspace_config_mock.has).toBeCalledWith("executablePath");
        expect(workspace_config_mock.get).toBeCalledWith("executablePath");
    });

    test('Configured with executable path but extention is disabled', async () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");

        enableExtention(false);
        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce("/cscope_path");
        let exe_path = engine_config.getExePath();
        expect(exe_path).toStrictEqual("");
    });

    test('Configured without database path', async () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");

        workspace_config_mock.has.mockReturnValueOnce(false);
        const database_path = engine_config.getDatabasePath();
        expect(database_path).toStrictEqual("/workspace/.vscode/cscope");
        expect(workspace_config_mock.has).toBeCalledWith("databasePath");
    });

    test('Configured with empty database path', async () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");

        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce("");
        const database_path = engine_config.getDatabasePath();
        expect(database_path).toStrictEqual("/workspace/.vscode/cscope");
        expect(workspace_config_mock.has).toBeCalledWith("databasePath");
        expect(workspace_config_mock.get).toBeCalledWith("databasePath");
    });

    test('Configured with valid database path', async () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");

        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce("${workspaceRoot}/my_data_base_path");
        let database_path = engine_config.getDatabasePath();
        expect(database_path).toStrictEqual("/workspace/my_data_base_path");
        expect(workspace_config_mock.has).toBeCalledWith("databasePath");
        expect(workspace_config_mock.get).toBeCalledWith("databasePath");

        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce("/my_data_base_path");
        database_path = engine_config.getDatabasePath();
        expect(database_path).toStrictEqual("/my_data_base_path");
        expect(workspace_config_mock.has).toBeCalledWith("databasePath");
        expect(workspace_config_mock.get).toBeCalledWith("databasePath");
    });

    test('open in new column is true', async () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");

        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce(true);
        const open_in_new_col = engine_config.openInNewCol();
        expect(open_in_new_col).toStrictEqual(true);
        expect(workspace_config_mock.has).toBeCalledWith("openInNewCol");
        expect(workspace_config_mock.get).toBeCalledWith("openInNewCol");
    });

    test('open in new column is false', async () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");

        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce(false);
        const open_in_new_col = engine_config.openInNewCol();
        expect(open_in_new_col).toStrictEqual(false);
        expect(workspace_config_mock.has).toBeCalledWith("openInNewCol");
        expect(workspace_config_mock.get).toBeCalledWith("openInNewCol");
    });

    test('getEngineCmdStrings shall return object configured in settings if extension is enabled', () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");
        enableExtention(true);

        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce({abc:123, def:456});
        let engine_cmd_cfg = engine_config.getEngineCmdStrings();
        expect(engine_cmd_cfg).toStrictEqual({abc:123, def:456});
        expect(workspace_config_mock.has).toBeCalledWith("engineCommands");
        expect(workspace_config_mock.get).toBeCalledWith("engineCommands");
    });

    test('getEngineCmdStrings shall return null object if extension is disabled', () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");
        enableExtention(false);

        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce({abc:123, def:456});
        let engine_cmd_cfg = engine_config.getEngineCmdStrings();
        expect(engine_cmd_cfg).toStrictEqual(null);
    });

    test('getEngineCmdStrings shall return null object if command is not configured', () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");
        enableExtention(true);

        workspace_config_mock.has.mockReturnValueOnce(false);
        let engine_cmd_cfg = engine_config.getEngineCmdStrings();
        expect(engine_cmd_cfg).toStrictEqual(null);
    });

    test('Configured with valid source code path', async () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");
        enableExtention(true);

        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce(["path1", "path2"]);
        const src_paths = engine_config.getSourcePaths();
        expect(src_paths).toStrictEqual(["path1", "path2"]);
        expect(workspace_config_mock.has).toBeCalledWith("sourceCodePaths");
        expect(workspace_config_mock.get).toBeCalledWith("sourceCodePaths");
    });

    test('Configured with invalid source code path', async () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");

        enableExtention(true);
        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce("path1");
        let src_paths = engine_config.getSourcePaths();
        expect(src_paths).toStrictEqual(["/workspace"]);
        expect(workspace_config_mock.has).toBeCalledWith("sourceCodePaths");
        expect(workspace_config_mock.get).toBeCalledWith("sourceCodePaths");

        enableExtention(true);
        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce(["path1", false]);
         src_paths = engine_config.getSourcePaths();
        expect(src_paths).toStrictEqual(["/workspace"]);
        expect(workspace_config_mock.has).toBeCalledWith("sourceCodePaths");
        expect(workspace_config_mock.get).toBeCalledWith("sourceCodePaths");
    });

    test('Configured with valid source code path but extension is disabled', async () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");

        enableExtention(false);
        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce(["path1"]);
        let src_paths = engine_config.getSourcePaths();
        expect(src_paths).toStrictEqual([]);
    });

    test('print command line is set to true but extension is disabled', async () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");

        enableExtention(false);
        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce(true);
        let src_paths = engine_config.getPrintCmd();
        expect(src_paths).toStrictEqual(false);
    });

    test('print command line is set to true', async () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");

        enableExtention(true);
        workspace_config_mock.has.mockReturnValueOnce(true);
        workspace_config_mock.get.mockReturnValueOnce(true);
        let src_paths = engine_config.getPrintCmd();
        expect(src_paths).toStrictEqual(true);
        expect(workspace_config_mock.has).toBeCalledWith("printCmdBeforeExecute");
        expect(workspace_config_mock.get).toBeCalledWith("printCmdBeforeExecute");
    });

    test('print command line is not configured', async () => {
        const engine_config = new ExtensionConfig(workspace_config_mock, "/workspace");

        enableExtention(true);
        workspace_config_mock.has.mockReturnValueOnce(false);
        let src_paths = engine_config.getPrintCmd();
        expect(src_paths).toStrictEqual(false);
        expect(workspace_config_mock.has).toBeCalledWith("printCmdBeforeExecute");
    });
});