# Change Log
All notable changes to the "linux-binary-preview" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2020-01-05
### Added:
 * Webview that displays `nm`, `ldd` and `file` information for `.so` and `.a` files

## [1.1.0] - 2020-01-13
### Added:
 * Add support for executable files not ending in `.so` or `.a`
## [2.0.0] - 2021-06-17
### Changed:
 * Replaced custom webview with newer `CustomEditor` API
## [2.2.0] - 2021-11-10
### Changed:
 * Improved handling of missing binaries in the system
## [2.3.0] - 2021-11-13
### Added:
 * Added support for compressed archives (.tar*, .zip, .rar, .7z)
### Changed:
 * Use MIME type to select which tools to run on a file
 * Further consolidated handling of missing binaries in the system