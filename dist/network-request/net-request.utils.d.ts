import type { Result, ResultAsync } from "../outcome/result.types.js";
import type { NetRequestFull, NetResponse, NetworkRequestSpec } from "./net-request.types.js";
export default function Build_NetRequest(spec: NetworkRequestSpec): Result<NetRequestFull>;
export declare function Send_NetRequest(req: NetRequestFull): ResultAsync<NetResponse>;
/**
 * check response status code
 */
export declare function checkResponseStatus(response: Response): Result<string>;
export declare function Validate_HTMLRes({ spec, res }: NetResponse): ResultAsync<HTMLElement>;
export declare function retry<T>(task: () => Promise<T>, maxAttempts: number, delayMs?: number): Promise<T>;
//# sourceMappingURL=net-request.utils.d.ts.map