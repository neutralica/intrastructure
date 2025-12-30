// net-request-wrappers.ts

import { ƒ_formatErr } from "../helpers/format-err.js";
import { $r } from "../outcome/result.infra.js";
import type { ResultAsync } from "../outcome/result.types.js";
import { r_$ } from "../outcome/result.wrappers.js";
import type { NetResponse } from "./net-request.types.js";
import { checkResponseStatus, Validate_HTMLRes } from "./net-request.utils.js";

export async function n_wrapHTML(resultPromise: ResultAsync<NetResponse>
): Promise<HTMLElement> {
    const r_result = r_$(await resultPromise);
    const element = r_$(await Validate_HTMLRes(r_result));
    return element;
}

export async function n_wrapJSON(resultPromise: ResultAsync<NetResponse>): ResultAsync<object> {
    const r = r_$(await resultPromise);
    void r_$(checkResponseStatus(r.res));

    try {
        const parsed = await r.res.json();
        return $r.OK(parsed);
    } catch (error) {
        return $r.XX(ƒ_formatErr(error));
    }

}

export async function n_wrapSEND(
    resultPromise: ResultAsync<NetResponse>
): Promise<number> {
    const r_result = r_$(await resultPromise).res;
    r_$(checkResponseStatus(r_result));
    return r_result.status;
}
