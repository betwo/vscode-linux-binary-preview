import { Tool } from './tool';
import { Nm } from './tools/nm';
import { Ldd } from './tools/ldd';
import { File } from './tools/file';
import { Zip } from './tools/zip';
import { Unrar } from './tools/unrar';
import { Tar } from './tools/tar';
import { SevenZip } from './tools/7z';

type MimeType = string;

export class ToolManager {
    default_tools: Tool[] = [];
    mime_types = new Map<MimeType, Tool[]>()

    constructor() {
        let tool_file = new File();
        let tool_ldd = new Ldd();
        let tool_nm = new Nm();
        let tool_zip = new Zip();
        let tool_tar = new Tar();
        let tool_unrar = new Unrar();
        let tool_7z = new SevenZip();

        this.registerDefaultTools([tool_file]);

        this.registerMimeType("application/x-sharedlib", [tool_ldd, tool_nm]);
        this.registerMimeType("application/x-archive", [tool_nm]);
        this.registerMimeType("application/zip", [tool_zip]);
        this.registerMimeType("application/x-tar", [tool_tar]);
        this.registerMimeType("application/x-xz", [tool_tar]);
        this.registerMimeType("application/gzip", [tool_tar]);
        this.registerMimeType("application/x-rar", [tool_unrar]);
        this.registerMimeType("application/x-7z-compressed", [tool_7z]);
        
    }

    public registerDefaultTools(tools: Tool[]) {
        for (const tool of tools) {
            if (this.default_tools.findIndex
                ((t) => t === tool) < 0) {
                this.default_tools.push(tool);
            }
        }
    }


    public registerMimeType(mime: MimeType, tools: Tool[]) {
        if (!this.mime_types.has(mime)) {
            this.mime_types[mime] = tools;
        } else {
            for (const tool of tools) {
                if (!this.mime_types[mime].has(tool)) {
                    this.mime_types[mime].push(tool);
                }
            }
        }
    }


    public getToolsForMimeType(mime_type: string): Tool[] {
        const entry = this.mime_types[mime_type];
        if (entry === undefined) {
            return this.default_tools;
    
        } else {
            return this.default_tools.concat(entry);
        }
    }
}