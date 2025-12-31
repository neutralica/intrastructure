// net-request-wrappers.ts
import { format_err } from "../helpers/format-err.js";
import { outcomeIs } from "../outcome/outcome.js";
import { wrap_data } from "../outcome/outcome.wrappers.js";
import { checkResponseStatus, Validate_HTMLRes } from "./net-request.utils.js";
export async function n_wrapHTML(outcomePromise) {
    const r_outcome = wrap_data(await outcomePromise);
    const element = wrap_data(await Validate_HTMLRes(r_outcome));
    return element;
}
export async function n_wrapJSON(outcomePromise) {
    const r = wrap_data(await outcomePromise);
    void wrap_data(checkResponseStatus(r.res));
    try {
        const parsed = await r.res.json();
        return outcomeIs.OK(parsed);
    }
    catch (error) {
        return outcomeIs.ERR(format_err(error));
    }
}
export async function n_wrapSEND(outcomePromise) {
    const r_outcome = wrap_data(await outcomePromise).res;
    wrap_data(checkResponseStatus(r_outcome));
    return r_outcome.status;
}
//# sourceMappingURL=net-request.wrappers.js.map