// net-request-wrappers.ts

import { format_err } from "../../helpers/format-err.js";
import { relay } from "../outcome/relay.js";
import type { OutcomeAsync } from "../outcome/outcome.types.js";
import { relay_data } from "../outcome/relay.wrappers.js";
import type { NetResponse } from "./net-request.types.js";
import { checkResponseStatus, validate_response } from "./net-request.utils.js";

export async function wrap_html_netreq(outcomePromise: OutcomeAsync<NetResponse>
): Promise<HTMLElement> {
    const oc = relay_data(await outcomePromise);
    const el = relay_data(await validate_response(oc));
    return el;
}

export async function n_wrapJSON(outcomePromise: OutcomeAsync<NetResponse>): OutcomeAsync<object> {
    const r = relay_data(await outcomePromise);
    void relay_data(checkResponseStatus(r.res));

    try {
        const parsed = await r.res.json();
        return relay.data(parsed);
    } catch (error) {
        return relay.err(format_err(error));
    }

}

export async function n_wrapSEND(
    outcomePromise: OutcomeAsync<NetResponse>
): Promise<number> {
    const r_outcome = relay_data(await outcomePromise).res;
    relay_data(checkResponseStatus(r_outcome));
    return r_outcome.status;
}
