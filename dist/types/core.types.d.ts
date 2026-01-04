export interface ClientStateObj {
    siteLoaded: boolean;
    contrast: "dark" | "light";
    lastPing: number | null;
    currentView: string;
    graphState: string;
}
export type MetaValue = string | boolean | number | null | undefined | string[];
export interface ClientMeta {
    source?: string;
    lineno?: number;
    colno?: number;
    error?: string;
    pid?: number;
    uptime?: number;
    href?: string;
    trace?: string[];
    enriched?: boolean;
    [key: string]: MetaValue;
}
export interface MemoryUsageLike {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers?: number;
}
export interface ServerMeta {
    pid: number;
    uptime: number;
    memoryUsage: MemoryUsageLike;
    argv: string;
    cwd: string;
    nodeVersion: string;
    clientIP: string;
    userAgent: string;
    requestID: string;
    platform?: string;
    trace?: string[];
    enriched?: boolean;
}
//# sourceMappingURL=core.types.d.ts.map