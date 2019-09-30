'use strict';

const default_cscope_config = {
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
            find_all_ref : "cscope -L0 ${text}",
            find_define : "cscope -L1 ${text}",
            find_callee : "cscope -L2 ${text}",
            find_caller : "cscope -L3 ${text}",
            find_text : "cscope -L4 ${text}"
        },
        {
            find_cmd : "cmd /C dir /s/a/b ${src_path}\\*.c ${src_path}\\*.h ${src_path}\\*.cpp ${src_path}\\*.cc ${src_path}\\*.mm",
            database_cmd : "cscope -b -q -k",
            find_all_ref : "cscope -L0 ${text}",
            find_define : "cscope -L1 ${text}",
            find_callee : "cscope -L2 ${text}",
            find_caller : "cscope -L3 ${text}",
            find_text : "cscope -L4 ${text}"
        }
    ]
};

export default class CmdParser {
    private userConfig : any;
    private currentConfig : any;
    private currentEngine : string;
    constructor (engine_cmd_string : object) {
        //now only cscope is supported so cscope would be the current config
        this.currentConfig = JSON.parse(JSON.stringify(default_cscope_config));
        this.currentEngine = "cscope";
        this.userConfig = engine_cmd_string;
    }

    private updateConfig(index_of_user_config, index_of_current_config : number) {
        let custom_command_set = null;
        if ((index_of_user_config >= 0) && (this.userConfig.config) && (index_of_user_config < this.userConfig.config.length )) {
            custom_command_set = this.userConfig.config[index_of_user_config];
        }

        if (custom_command_set) {
            const all_cmds = Object.keys(custom_command_set);
            const current_cmd_set = this.currentConfig.config[index_of_current_config];
            all_cmds.forEach((value) => {
                current_cmd_set[value] = custom_command_set[value];
            });
        }
    }

    public getCurrentCmds() : object {
        if ((this.userConfig) && (this.userConfig.config_index)) {
            const config_keys = Object.keys(this.userConfig.config_index);
            for (let i = 0; i < config_keys.length; ++i) {
                if (config_keys[i] === this.currentEngine) {
                    const index_keys = Object.keys(this.userConfig.config_index[this.currentEngine]);
                    for (let j = 0; j < index_keys.length; ++j) {
                        const current_key = index_keys[j];
                        if (Object.keys(this.currentConfig.platform_index).includes(current_key)) {
                            const target_index = this.currentConfig.platform_index[current_key];
                            const src_index_value : any = this.userConfig.config_index[this.currentEngine][current_key];
                            this.updateConfig(src_index_value, target_index);
                        }
                    }
                }
            }
        }
        return this.currentConfig;
    }
};
