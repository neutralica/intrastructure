// net-request-wrappers.ts
import { format_err } from "../helpers/format-err.js";
import { relay } from "../outcome/relay.js";
import { wrap_data } from "../outcome/relay.wrappers.js";
import { checkResponseStatus, validate_response } from "./net-request.utils.js";
export async function wrap_html_netreq(outcomePromise) {
    const oc = wrap_data(await outcomePromise);
    const el = wrap_data(await validate_response(oc));
    return el;
}
export async function n_wrapJSON(outcomePromise) {
    const r = wrap_data(await outcomePromise);
    void wrap_data(checkResponseStatus(r.res));
    try {
        const parsed = await r.res.json();
        return relay.data(parsed);
    }
    catch (error) {
        return relay.err(format_err(error));
    }
}
export async function n_wrapSEND(outcomePromise) {
    const r_outcome = wrap_data(await outcomePromise).res;
    wrap_data(checkResponseStatus(r_outcome));
    return r_outcome.status;
}
//# sourceMappingURL=net-request.wrappers.js.map