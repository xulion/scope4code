# VS Code cscope support
     This extension add cscope support for VS Code. Currently it can only support C/C++.

## Who may need this extension
     VS Code C/C++ extension already supported tag parsing and symbol searching. However, when working with a very large projects, the way it works could be very annoying:
     * It will search all the folders for all source code while creating database. And it's very slow
         * No option to ignore symbolic link
         * No easy way to exclude unwanted file when the project structure is complex.
     * Every time when Code is launches, all files will be checked for possible changes. This also takes long time to finish.

## Usage
    * Build database:
        * Press F1 or Ctrl+Shift+P to open command window, select "Cscope: Build database" to start building.
    * Find references
        * Once database is ready to use, right click on a symbol then select "Find All References" to find all occurence of the symbol.
    * Find definition
        *  Once database is ready to use, right click on a symbol then select "Go to Definition " to find all possible definition of the symbol.