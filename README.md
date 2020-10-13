# VS Code cscope support
This extension add cscope support to Visual Studio Code. It supports C/C++ only (all other languages are not tested). 
For any issue you have, pleases log it [here](https://github.com/xulion/scope4code/issues). Your help can improve this extension.

## Who may need this extension
Visual Studio Code C/C++ extension has the support for symbol parsing and searching, which is based on Clang tag system. However, when working with a very large projects (over 10K files), it could be very slow and annoying (based on my experience):
* It would try search all the folders for all source code while creating database. It takes hours to build the database.
* There is no option to ignore symbolic link (Leaves no chance for developer to optimize the build, unless developper is happenly using CMake system).
* No easy way to exclude unwanted file when the project structure is complex.
* Every time when code is changed, it tries to update the database which might take another hour or so. If developper is keep changing code, the extension will keep running and keep occupying a lot of processor time.

scope4code uses cscope, which works very well with large project. Database build time normally withing 1 minutes and search is extremely fast (at least with Linux filesystem).

## Usage
* Dependency:
    * In order to use this extension, cscope shall be installed and accessible via command line. The extension is designed to call 'cscope' command line to get everything done. If for some reason cscope is not able to be called from a default shell, a path could be added to following setting (replace <cscope_path> with full path):
    ```
    "scope4code.executablePath": "<cscope_path>"
    ```
    **For windows user:** pls download cscope from [here](https://code.google.com/archive/p/cscope-win32/downloads). Extract the exe after download and add path to user or system evironment.
    **For Linux user:** Do not use ~/ in <cscope_path>. It has to be the full absolute path (e.g. if cscope is in ~/bin, shall replace <cscope_path> with "/home/user_a/bin").
    
* Build database:
    * Press F1 or Ctrl+Shift+P to open command window, select "Cscope: Build database" to start building.
* Find all references
    * Once database is ready to use, right click on a symbol then select "Find All References" to find all occurence of the symbol.
* Find definition
    *  Once database is ready to use, right click on a symbol then select "Go to Definition " to find all possible definition of the symbol.
* Other commands via F1:
    * Cscope: Find this C symbol (same as "Find all references").
    * Cscope: Find this function definition (same as "Find definition").
    * Cscope: Find functions called by this function.
    * Cscope: Find functions calling this function.
    * Cscope: Find this text string.
* Configuration:
    * Configuration for this extension not moved to vscode settings. cscope_conf.json is no longer supported since version 0.2.0. By default the extension is enabled and it will parse all code in current workspace. Configuration can be changed via vscode's setting menu, pls see [here](https://code.visualstudio.com/docs/getstarted/settings) for how to manage setting.<br>
     *Important Note: Most of the setting shall be configured under workspace setting so it only applies to current project. If the settings is added to user setting then all projects will be impacted!!!*
    * Below settings are supported:
        * enableScope - This can be used to disable this extension for a workspace (or globally depends on which setting is updated).
        * executablePath - Path (absolute) where cscope executable resides.
        * printCmdBeforeExecute - A debugging flag. Enabling it the engine will show full commandline via notification window during search and build. This is helpful when there is any issue.
        * openInNewCol - Enable it the search result will be opened in a new column.
        * sourceCodePaths - This is an array of the paths where all source code files need to be parsed. It allows to include paths that outside of the vs code project. Default value is ${workspaceRoot}.
        * excludedPaths - An array of rules to exclude files. Each entry shall be a regular expression. If the file paths matches the rule it would be removed from source file list when database is built. For example rule "/exclude/.*" will exclude any file under filder "/exclude/".
        * databasePath - The path indicates where the cscope database should be built/and found. Default value is ${workspaceRoot}/.vscode/cscope as this was the default path before.
        * engineCommands - Commands used for build and search. See "Command customization" for detailed description.
* Command customization 
    * Starting from version 0.1.00, customized command is supported. By updating setting "scope4code.engineCommands", all commands used by this extension could be customized. Below example shows a setting with updated the search and find ref command for Linux and build command for Windows:
    ```
    scope4code.engineCommands : {
        "config_index" : {
            "cscope" : {
                "win32" : 1,
                "linux" : 0
            }
        },
        "config": [
            {
                "find_cmd": "find ${src_path} -type f -name *.c -o -type f -name *.cpp",
                "find_all_ref" : "cscope -L0 ${text}",
            },
            {
                "database_cmd": "cscope -b -k"
            }
        ]
    }
    ```
    * engineCommands reference <br/>
    Customizable commands:

    | field | description |
    | --- | --- |
    | find_cmd | Command to list all source files |
    | database_cmd | build database |
    | find_all_ref | find all reference of a symbol |
    | find_define | find definition of a symbol |
    | find_callee | find functions called by this function (symbol) |
    | find_caller | find functions calling this function (symbol) |
    | find_text | find this text string |

    Built-in variables:
    There are variables defined could be used (some has to, such as ${text}) to build command. Here is a list of supported variables:
    
    | name | description |
    | --- | --- |
    | ${src_path} | source folders configured in engine_configurations.cscope.paths, by default (if not configured) this would be workspace path |
    | ${database_path} | path where database file would be generated. It's configured via engine_configurations.cscope.database_path. It's .vscode/cscope by default (if not configured) |
    | ${text} | text (symbol) to be searched |
    | ${workspaceRoot} | workspace root of current vscode window|


        
