import type { ServerMeta as ServerMetaCore } from "./state-meta.types.js";
export interface ServerMeta extends Omit<ServerMetaCore, "memoryUsage"> {
    memoryUsage: NodeJS.MemoryUsage;
}
//# sourceMappingURL=state-meta.node.types.d.ts.map