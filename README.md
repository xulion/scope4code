# VS Code cscope support
This extension add cscope support for Visual Studio Code. Supports C/C++ only (all other languages are not tested). The extension is still preliminary. If you encounter any issue, pleases log it [here](https://github.com/xulion/scope4code/issues). Your help can improve this extension.

## Who may need this extension
Visual Studio Code C/C++ extension already supported tag parsing and symbol searching, which is based on Clang tag system. However, when working with a very large projects (over 10K files), it could be very annoying (based on my experience):
* The extension will try search all the folders for all source code while creating database. It takes hours to build the database.
* There is no option to ignore symbolic link (Leaves no chance for developer to optimize the build, unless developper is happenly using CMake system).
* No easy way to exclude unwanted file when the project structure is complex.
* Every time when code is changed, it tries to update the database which might take another hour or so. If developper is keep changing code, the extension will keep running and keep occupying a lot of processor time.

## Usage
* Dependency:
    * In order to use this extension, cscope has to be installed and shall be accessible via command line. The extension is designed to call 'cscope' command line to get everything done. If for some reason cscope is not able to be called from a default shell, a path could be added to following setting (replace <cscope_path> with full path):
    ```
    "scope4code.executablePath": "<cscope_path>"
    ```
    **For windows user:** pls download cscope from [here](https://code.google.com/archive/p/cscope-win32/downloads). Extract the exe after download and add path to user or system evironment.
    **For Linux user:** Do not use ~/ in <cscope_path>. It has to be the full absolute path.
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
    * Configuration is supported via cscope_conf.json. This file will be automatically creted in .vscode folder once the extension is enabled.
    * Below settings are supported:
        * open_new_column - This flag controls how shall new .find window shall be opened. 'yes' means it shall be opened in a separate column while 'no' will open in a new tab. Default setting is no since v0.0.5.
        * engine_configurations.cscope.paths - This is an array of the paths where all source code files need to be parsed. It allows to include paths that outside of the vs code project. Default value is ${workspaceRoot}.
        * engine_configurations.cscope.database_path - The path indicates where the cscope database should be built/and found. Default value is ${workspaceRoot}/.vscode/cscope as this was the default path before.
        * engine_configurations.cscope.build_command - specify a build command for generating the cscope database. Default value is "", to use the built-int algorithm
