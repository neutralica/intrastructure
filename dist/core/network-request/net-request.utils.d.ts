import type { Outcome, OutcomeAsync } from "../outcome/outcome.types.js";
import type { NetRequestFull, NetResponse, NetworkRequestSpec } from "./net-request.types.js";
export declare function checkResponseStatus(response: Response): Outcome<void>;
export default function build_net_req(spec: NetworkRequestSpec): Outcome<NetRequestFull>;
export declare function send_net_req(req: NetRequestFull): OutcomeAsync<NetResponse>;
export declare function validate_response({ spec, res }: NetResponse): OutcomeAsync<HTMLElement>;
export declare function retry<T>(task: () => Promise<T>, maxAttempts: number, delayMs?: number): Promise<T>;
//# sourceMappingURL=net-request.utils.d.ts.map