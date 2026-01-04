import type { ServerMeta as ServerMetaCore } from "./network.types.js";
export interface ServerMeta extends Omit<ServerMetaCore, "memoryUsage"> {
    memoryUsage: NodeJS.MemoryUsage;
}
//# sourceMappingURL=node.types.d.ts.map