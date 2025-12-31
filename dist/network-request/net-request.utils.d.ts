import type { Outcome, OutcomeAsync } from "../outcome/outcome.types.js";
import type { NetRequestFull, NetResponse, NetworkRequestSpec } from "./net-request.types.js";
export default function Build_NetRequest(spec: NetworkRequestSpec): Outcome<NetRequestFull>;
export declare function Send_NetRequest(req: NetRequestFull): OutcomeAsync<NetResponse>;
/**
 * check response status code
 */
export declare function checkResponseStatus(response: Response): Outcome<string>;
export declare function Validate_HTMLRes({ spec, res }: NetResponse): OutcomeAsync<HTMLElement>;
export declare function retry<T>(task: () => Promise<T>, maxAttempts: number, delayMs?: number): Promise<T>;
//# sourceMappingURL=net-request.utils.d.ts.map