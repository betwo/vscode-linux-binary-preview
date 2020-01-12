# Linux Binary Preview

[![Licence](https://img.shields.io/github/license/betwo/vscode-linux-binary-preview.svg)](https://github.com/betwo/vscode-linux-binary-preview)
[![VS Code Marketplace](https://vsmarketplacebadge.apphb.com/version-short/betwo.vscode-linux-binary-preview.svg) ![Rating](https://vsmarketplacebadge.apphb.com/rating-short/betwo.vscode-linux-binary-preview.svg) ![Downloads](https://vsmarketplacebadge.apphb.com/downloads-short/betwo.vscode-linux-binary-preview.svg) ![Installs](https://vsmarketplacebadge.apphb.com/installs-short/betwo.vscode-linux-binary-preview.svg)](https://marketplace.visualstudio.com/items?itemName=betwo.vscode-linux-binary-preview)

![Preview GIF](https://raw.githubusercontent.com/betwo/vscode-linux-binary-preview/master/assets/preview.gif)

Open binary Linux files and display information about the symbols contained.

Supported file types are:
 * Shared objects (.so)
 * Archives (.a)
 * Executable binary files

Displayed information is the output of the commands
 * `file` (File information)
 * `ldd` (Linked libraries, if available)
 * `nm` (Contained symbols)