# Linux Binary Preview

[![Licence](https://img.shields.io/github/license/betwo/vscode-linux-binary-preview.svg)](https://github.com/betwo/vscode-linux-binary-preview)
[![VS Code Marketplace](https://vsmarketplacebadge.apphb.com/version-short/betwo.vscode-linux-binary-preview.svg) ![Rating](https://vsmarketplacebadge.apphb.com/rating-short/betwo.vscode-linux-binary-preview.svg) ![Downloads](https://vsmarketplacebadge.apphb.com/downloads-short/betwo.vscode-linux-binary-preview.svg) ![Installs](https://vsmarketplacebadge.apphb.com/installs-short/betwo.vscode-linux-binary-preview.svg)](https://marketplace.visualstudio.com/items?itemName=betwo.vscode-linux-binary-preview)

![Preview GIF](https://raw.githubusercontent.com/betwo/vscode-linux-binary-preview/master/assets/preview.gif)

Open binary Linux files and display information about the symbols contained.

## Supported file types

 * Shared objects (.so)
 * Archives (.a)
 * Executable binary files
 * Compressed Archives (.tar, .rar, .zip, .7z)

Displayed information for shared objects / archives is the output of the commands
 * `file` (File information)
 * `ldd` (Linked libraries, if available)
 * `nm` (Contained symbols)
 which have to be installed in your system.

For compressed archives, the contained file names are displayed.

## Tool System Dependencies

| Tool      | Debian / Ubuntu Package |
| --------- | ------------------------|
| **file**  | file                    |
| **nm**    | binutils                |
| **ldd**   | libc-bin                |
| **zip**   | zip                     |
| **tar**   | tar                     |
| **7z**    | p7zip-full              |
| **unrar** | unrar                   |

Install them with `apt-get install <pkg>` if you want to see the relavant output.

All tools paths can be configured via `vscode-linux-binary-preview.<tool>_command`, e.g.
```json
{
    "vscode-linux-binary-preview.nm_command": "/usr/local/bin/nm"
}
```