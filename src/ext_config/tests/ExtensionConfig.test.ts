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

    function initiate_config(exe_path : string,
                            enable_field_exist : boolean = true,  
                            enabled : boolean = true) : any 
    {
        // for field enable
        workspace_config_mock.has.mockReturnValueOnce(enable_field_exist);
        if (enable_field_exist) {
            workspace_config_mock.get.mockReturnValueOnce(enabled);
        }

        //for field exePath
        if (exe_path) {
            workspace_config_mock.has.mockReturnValueOnce(true);
            workspace_config_mock.get.mockReturnValueOnce(exe_path);
        }
        else {
            workspace_config_mock.has.mockReturnValueOnce(false);
        }

        const engine_config = new ExtensionConfig(workspace_config_mock, "/abc/config.json", "/workspace");

        let get_count = 0;
        expect(workspace_config_mock.has).toBeCalledTimes(2);
        expect(workspace_config_mock.has).toBeCalledWith("enableScope");
        if (enable_field_exist) {
            get_count++;
            expect(workspace_config_mock.get).toBeCalledWith("enableScope");
        }
        else {
            enabled = true;
        }
        
        expect(workspace_config_mock.has).toBeCalledWith("executablePath");
        if (exe_path) {
            get_count++;
            expect(workspace_config_mock.get).toBeCalledWith("executablePath");
        }

        expect(workspace_config_mock.get).toBeCalledTimes(get_count);

        const engine_enabled = engine_config.enabled();
        expect(engine_enabled).toBe(enabled);
        return engine_config;
    }

    function validateConfig(engine_config : any, config_json_str : string) {
        fs.readFileSync.mockReturnValueOnce(Buffer.from(config_json_str));

        const config_valid = engine_config.validateConfig();
        expect(config_valid).toBe(true);

        expect(fs.accessSync).toBeCalledTimes(1);
        expect(fs.accessSync).toBeCalledWith("/abc/config.json", fs.constants.R_OK);

        expect(fs.readFileSync).toBeCalledTimes(1);
        expect(fs.readFileSync).toBeCalledWith("/abc/config.json");
        fs.readFileSync.mockReset();
    }

    test('Configured with no enable field', async () => {

        const engine_config = initiate_config("/abc", false, false);

        validateConfig(engine_config, "{}");

        const exe_path = engine_config.getExePath();
        expect(exe_path).toBe("/abc");
    });

    test('Configured to be disabled', async () => {

        const engine_config = initiate_config("/abc", true, false);

        validateConfig(engine_config, "{}");

        const exe_path = engine_config.getExePath();
        expect(exe_path).toBe("");
    });

    test('Nothing is configured', async () => {

        const engine_config = initiate_config(undefined);

        validateConfig(engine_config, "{}");

        const exe_path = engine_config.getExePath();
        expect(exe_path).toBe("");

        const database_path = engine_config.getDatabasePath();
        expect(database_path).toBe("/workspace/.vscode/cscope");

        const open_in_new_col = engine_config.openInNewCol();
        expect(open_in_new_col).toBe(false);

        const src_paths = engine_config.getSourcePaths();
        expect(src_paths).toStrictEqual(["/workspace"]);

        const build_cmd = engine_config.getBuildCmd();
        expect(build_cmd).toStrictEqual("");
    });

    test('executable path is configured as null', async () => {
        const engine_config = initiate_config(null);

        validateConfig(engine_config, "{}");

        const exe_path = engine_config.getExePath();
        expect(exe_path).toBe("");
    });

    test('Configured with executable path', async () => {
        const engine_config = initiate_config("/cscope_path");

        validateConfig(engine_config, "{}");

        const exe_path = engine_config.getExePath();
        expect(exe_path).toBe("/cscope_path");
    });

    test('Configured without database path', async () => {
        const scope_config = {
            version : "0.0.13",
            open_new_column : "no",
            engine_configurations: [
                {
                    cscope : {
                        "build_command" : "abc",
                        paths : [
                            "/my_source/src"
                        ]
                    }
                }
            ]
        }
        const engine_config = initiate_config("/cscope_path");

        validateConfig(engine_config, JSON.stringify(scope_config));

        const database_path = engine_config.getDatabasePath();
        expect(database_path).toBe("/workspace/.vscode/cscope");

        const open_in_new_col = engine_config.openInNewCol();
        expect(open_in_new_col).toBe(false);

        const src_paths = engine_config.getSourcePaths();
        expect(src_paths).toStrictEqual(["/my_source/src"]);

        const build_cmd = engine_config.getBuildCmd();
        expect(build_cmd).toStrictEqual("abc");
    });

    test('Configured with database path and new col mode', async () => {
        const scope_config = {
            version : "0.0.13",
            open_new_column : "YeS",
            engine_configurations: [
                {
                    cscope : {
                        paths : [
                            "/my_source1/src",
                            "/my_source2/src"
                        ],
                        database_path : "/database/cscope"
                    }
                }
            ]
        }
        const engine_config = initiate_config("/cscope_path");

        validateConfig(engine_config, JSON.stringify(scope_config));

        const database_path = engine_config.getDatabasePath();
        expect(database_path).toBe("/database/cscope");

        const open_in_new_col = engine_config.openInNewCol();
        expect(open_in_new_col).toBe(true);

        const src_paths = engine_config.getSourcePaths();
        expect(src_paths).toStrictEqual(["/my_source1/src", "/my_source2/src"]);

        const build_cmd = engine_config.getBuildCmd();
        expect(build_cmd).toStrictEqual("");
    });

    test('Configured without open new col and no source code path', async () => {
        const scope_config = {
            version : "0.0.13",
            engine_configurations: [
                {
                    cscope : {
                        database_path : "/database/cscope"
                    }
                }
            ]
        }
        const engine_config = initiate_config("/cscope_path");

        validateConfig(engine_config, JSON.stringify(scope_config));

        const database_path = engine_config.getDatabasePath();
        expect(database_path).toBe("/database/cscope");

        const open_in_new_col = engine_config.openInNewCol();
        expect(open_in_new_col).toBe(false);

        const src_paths = engine_config.getSourcePaths();
        expect(src_paths).toStrictEqual(["/workspace"]);

        const build_cmd = engine_config.getBuildCmd();
        expect(build_cmd).toStrictEqual("");
    });

    test('validateConfig shall return false if file does not exist ', () => {
        const engine_config = initiate_config("/cscope_path");

        fs.accessSync.mockImplementationOnce(() =>{
            throw ({message : "abc"});
        });

        const config_valid = engine_config.validateConfig();
        expect(config_valid).toBe(false);
        expect(engine_config.getErrorString()).toBe("No config json exist or config is invalid. User default");

        expect(fs.accessSync).toBeCalledTimes(1);
        expect(fs.accessSync).toBeCalledWith("/abc/config.json", fs.constants.R_OK);

        const open_in_new_col = engine_config.openInNewCol();
        expect(open_in_new_col).toBe(false);

        const src_paths = engine_config.getSourcePaths();
        expect(src_paths).toStrictEqual(["/workspace"]);

        const build_cmd = engine_config.getBuildCmd();
        expect(build_cmd).toStrictEqual("");

        fs.readFileSync.mockReset();
    });

    test('validateConfig shall return false and unknown error if file does not exist and error does not contain message', () => {
        const engine_config = initiate_config("/cscope_path");

        fs.accessSync.mockImplementationOnce(() =>{
            throw ({});
        });

        const config_valid = engine_config.validateConfig();
        expect(config_valid).toBe(false);
        expect(engine_config.getErrorString()).toBe("No config json exist or config is invalid. User default");

        expect(fs.accessSync).toBeCalledTimes(1);
        expect(fs.accessSync).toBeCalledWith("/abc/config.json", fs.constants.R_OK);

        const open_in_new_col = engine_config.openInNewCol();
        expect(open_in_new_col).toBe(false);

        const src_paths = engine_config.getSourcePaths();
        expect(src_paths).toStrictEqual(["/workspace"]);

        const build_cmd = engine_config.getBuildCmd();
        expect(build_cmd).toStrictEqual("");

        fs.readFileSync.mockReset();
    });
});