// net-request-wrappers.ts

import { format_err } from "../helpers/format-err.js";
import { outcomeIs } from "../outcome/outcome.infra.js";
import type { OutcomeAsync } from "../outcome/outcome.types.js";
import { r_$ } from "../outcome/outcome.wrappers.js";
import type { NetResponse } from "./net-request.types.js";
import { checkResponseStatus, Validate_HTMLRes } from "./net-request.utils.js";

export async function n_wrapHTML(outcomePromise: OutcomeAsync<NetResponse>
): Promise<HTMLElement> {
    const r_outcome = r_$(await outcomePromise);
    const element = r_$(await Validate_HTMLRes(r_outcome));
    return element;
}

export async function n_wrapJSON(outcomePromise: OutcomeAsync<NetResponse>): OutcomeAsync<object> {
    const r = r_$(await outcomePromise);
    void r_$(checkResponseStatus(r.res));

    try {
        const parsed = await r.res.json();
        return outcomeIs.OK(parsed);
    } catch (error) {
        return outcomeIs.ERR(format_err(error));
    }

}

export async function n_wrapSEND(
    outcomePromise: OutcomeAsync<NetResponse>
): Promise<number> {
    const r_outcome = r_$(await outcomePromise).res;
    r_$(checkResponseStatus(r_outcome));
    return r_outcome.status;
}
