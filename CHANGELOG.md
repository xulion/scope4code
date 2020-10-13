## [Beta v0.2.0]
### New Features:
- All configurations are now moved to vscode setting.
- Added support to exclude un-wanted files.
- *IMPORTANT: Please read configuration section of readme to ensure setting is properly configured!*
### Bug fixing:
- FIxed searching does not work when there are spaces in target text.

## [Beta v0.1.4]
- Update default cmd line param.
   Credit to [Oleg A. Arkhangelsky](https://github.com/oleg-umnik).

## [Beta v0.1.3]
- Support definition search in context menu.
   Credit to [Oleg A. Arkhangelsky](https://github.com/oleg-umnik).

## [Beta v0.1.2]
- Fix variable tables in readme.

## [Beta v0.1.1]
- All commands could be customized.

## [Beta v0.0.15]
### New Feauture
- Support to disable cscope for a workspace.
- Support adding path for cscope executable. 

### Bug fixing

## [Beta v0.0.14]
### New Feauture
- Added windows support.

### Bug fixing


## [Beta v0.0.13]
### New Feauture
- None

### Bug fixing
- Fix compatibility issue. v0.0.12 is not compatible with old configure file.  

## [Beta v0.0.12]
### New Feauture
- Added support for placing database anywhere. Thanks to [Yves](https://github.com/ydeweerdt) for making this happen!

### Bug fixing
- None

## [Beta v0.0.11]
### New Feauture
- None.

### Bug fixing
- Disabled definition provider. Current design will cause search to stuck while definition provider is running in background.
- Updated dependency package to avoid security vulnerabilities.

## [Beta v0.0.10]
### New Feauture
- Added status bar support. The current status of database (ready, no database, no cscope) will be displayed.

### Bug fixing
- Removed extra / from the beginning of the file path. This would allow file explorer to locate the source file.

## [Beta v0.0.9]
- Reload configuration file before building database. Older version require reload before build. <br>
  Thanks to [Lin Chieh](https://github.com/jaycetyle)

## [Beta v0.0.8]
- Fixed issue that symbol from input box is not working.

## [Beta v0.0.7]
- Support editing symbols (or type in symbols) before search.
- In the latest version of vscode, folder .vscode will not be created by default. Previous version assumed the folder is ready thus it fails to create files. This update will automatically create the folder if the folder is not detected.

## [Beta v0.0.6]
- Issue fix: document link get corrupted after more than one search. For detail, refer to [#13](https://github.com/xulion/scope4code/issues/13).

## [Beta v0.0.5]
- Error handling update, include check avalability of cscope command and other stuff.

## [Beta v0.0.4]
- Initial release, include very basic functionalities.