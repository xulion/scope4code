# VS Code cscope support
This extension add cscope support for Visual Studio Code. Currently it supports only C/C++.

## Who may need this extension
Visual Studio Code C/C++ extension already supported tag parsing and symbol searching, which is based on Clang tag system. However, when working with a very large projects, the way it currently works could be very annoying:
* The extension will try search all the folders for all source code while creating database. It takes hours to build the database.
* There is no option to ignore symbolic link (Leaves no chance for developer to optimize the build, unless developper is happenly using CMake system).
* No easy way to exclude unwanted file when the project structure is complex.
* Every time when there is code change, it tries to update the database which might take another hour or so. If developper is keep changing code, the extension will keep running and keep occupying a lot of processor time.

## Usage
* Dependency:
    * In order to use this extension, cscope has to be installed and shall be accessible via command line. The extension is designed to call 'cscope' command line to get everything done. It might not work in Windows.
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

        