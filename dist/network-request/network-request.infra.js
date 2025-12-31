// network-request.infra.ts
import { outcomeIs } from "../outcome/outcome.js";
import { wrap_data } from "../outcome/outcome.wrappers.js";
import { RetryPresetΔ } from "./net-request.consts.js";
import Build_NetRequest, { Send_NetRequest } from "./net-request.utils.js";
export const $n = {
    NewNetRequest: () => ({
        GET: () => n_wrap({ method: 'GET', failBehavior: RetryPresetΔ.DEFAULT }),
        POST: () => n_wrap({ method: 'POST', failBehavior: RetryPresetΔ.DEFAULT }),
        PUT: () => n_wrap({ method: 'PUT', failBehavior: RetryPresetΔ.DEFAULT }),
        DELETE: () => n_wrap({ method: 'DELETE', failBehavior: RetryPresetΔ.DEFAULT }),
    }),
};
function isNetRequestSpec(spec) {
    return (typeof spec.url === 'string' &&
        typeof spec.method === 'string');
}
function n_wrap(spec) {
    return {
        ...spec,
        to(url) {
            return n_wrap({
                ...spec,
                url
                // HTMLDiscriminant as a catch all is not correct for all cases TODO
            });
        },
        getIngredView() {
            return n_wrap({
                ...spec,
                url: '/view/ingredients',
                expectHTML: true,
                headers: {
                    ...(spec.headers ?? {}),
                    Accept: 'text/html',
                }
            });
        },
        getHomeScreen() {
            return n_wrap({
                ...spec,
                url: '/view/home',
                expectHTML: true,
                headers: {
                    ...(spec.headers ?? {}),
                    Accept: 'text/html',
                }
            });
        },
        getGraph() {
            return n_wrap({
                ...spec,
                url: '/api/graph/',
                expectHTML: true,
                headers: {
                    ...(spec.headers ?? {}),
                    Accept: 'text/html',
                }
            });
        },
        getState() {
            return n_wrap({
                ...spec,
                url: '/api/status',
            });
        },
        // requireMethod(m: N_ReqMethod) {
        //     return n_wrap({
        //         ...spec,
        //         method: m,
        //     });
        // },
        withQuery(query) {
            return n_wrap({
                ...spec,
                query: {
                    ...(query ?? {}),
                    ...query
                },
            });
        },
        withBody(body) {
            return n_wrap({
                ...spec,
                body
                // S may or may not be the correct generic here?
            });
        },
        withHeaders(headers) {
            return n_wrap({
                ...spec,
                headers: {
                    ...(spec.headers ?? {}),
                    ...headers
                }
            });
        },
        // TODO - I notice asJSON and asHTML don't enforce return types
        asJSON() {
            return n_wrap({
                ...spec,
                expectJSON: true,
            });
        },
        asText() {
            return n_wrap({
                ...spec,
                expectJSON: false,
                // TODO— *not* JSONSPec
            });
        },
        // TODO - I notice asJSON and asHTML don't enforce return types 
        asHTML(extract = '.response-container') {
            return n_wrap({
                ...spec,
                expectHTML: true,
                extractElement: extract,
                headers: {
                    ...spec.headers,
                    Accept: 'text/html',
                }
            });
        },
        onFailure(failBehavior) {
            return n_wrap({
                ...spec,
                failBehavior,
            });
        },
        SEND() {
            if (!isNetRequestSpec(spec)) {
                // 'throw' required here rather than return (which errors) - investigate (todo)
                throw outcomeIs.ERR('no url or method on NetReq');
            }
            const r_netreq = wrap_data(Build_NetRequest(spec));
            return Send_NetRequest(r_netreq);
        },
        // withMeta(meta: Record<string, unknown>) {}
        // toLogin(){}
        // toUserProfile(){}
    };
}
;
//# sourceMappingURL=network-request.infra.js.map