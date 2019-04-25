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