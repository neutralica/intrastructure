import type { ServerMeta as ServerMetaCore } from "./core.types.js";
export interface ServerMeta extends Omit<ServerMetaCore, "memoryUsage"> {
    memoryUsage: NodeJS.MemoryUsage;
}
//# sourceMappingURL=node.types.d.ts.map