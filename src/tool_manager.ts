import { Tool } from './tool';
import { Nm } from './tools/nm';
import { Ldd } from './tools/ldd';
import { File } from './tools/file';

type MimeType = string;

export class ToolManager {
    default_tools: Tool[] = [];
    mime_types = new Map<MimeType, Tool[]>()

    constructor() {
        let tool_file = new File();
        let tool_ldd = new Ldd();
        let tool_nm = new Nm();

        this.registerDefaultTools([tool_file]);

        this.registerMimeType("application/x-sharedlib", [tool_ldd, tool_nm]);
        this.registerMimeType("application/x-archive", [tool_nm]);
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