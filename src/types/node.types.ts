// state-meta.node.types.ts (node-only)

// Pull in the core types
import type { ServerMeta as ServerMetaCore } from "./network.types.js";

// A Node-specific ServerMeta that preserves your original typing
export interface ServerMeta extends Omit<ServerMetaCore, "memoryUsage"> {
  memoryUsage: NodeJS.MemoryUsage;
}