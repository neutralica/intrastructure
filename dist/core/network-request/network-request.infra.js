// network-request.infra.ts
import { relay } from "../outcome/relay.js";
import { relay_data } from "../outcome/relay.wrappers.js";
import { RetryPresetΔ } from "./net-request.consts.js";
import build_net_req, { send_net_req } from "./net-request.utils.js";
export const netReq = {
    NewNetRequest: () => ({
        GET: () => wrapNetReq({ method: 'GET', failBehavior: RetryPresetΔ.DEFAULT }),
        POST: () => wrapNetReq({ method: 'POST', failBehavior: RetryPresetΔ.DEFAULT }),
        PUT: () => wrapNetReq({ method: 'PUT', failBehavior: RetryPresetΔ.DEFAULT }),
        DELETE: () => wrapNetReq({ method: 'DELETE', failBehavior: RetryPresetΔ.DEFAULT }),
    }),
};
function isNetRequestSpec(spec) {
    return (typeof spec.url === 'string' &&
        typeof spec.method === 'string');
}
function wrapNetReq(spec) {
    return {
        ...spec,
        to(url) {
            return wrapNetReq({
                ...spec,
                url
                // HTMLDiscriminant as a catch all is not correct for all cases TODO
            });
        },
        getIngredView() {
            return wrapNetReq({
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
            return wrapNetReq({
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
            return wrapNetReq({
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
            return wrapNetReq({
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
            return wrapNetReq({
                ...spec,
                query: {
                    ...(query ?? {}),
                    ...query
                },
            });
        },
        withBody(body) {
            return wrapNetReq({
                ...spec,
                body
                // S may or may not be the correct generic here?
            });
        },
        withHeaders(headers) {
            return wrapNetReq({
                ...spec,
                headers: {
                    ...(spec.headers ?? {}),
                    ...headers
                }
            });
        },
        // TODO - I notice asJSON and asHTML don't enforce return types
        asJSON() {
            return wrapNetReq({
                ...spec,
                expectJSON: true,
            });
        },
        asText() {
            return wrapNetReq({
                ...spec,
                expectJSON: false,
                // TODO— *not* JSONSPec
            });
        },
        // TODO - I notice asJSON and asHTML don't enforce return types 
        asHTML(extract = '.response-container') {
            return wrapNetReq({
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
            return wrapNetReq({
                ...spec,
                failBehavior,
            });
        },
        SEND() {
            if (!isNetRequestSpec(spec)) {
                // 'throw' required here rather than return (which errors) - investigate (todo)
                throw relay.err('no url or method on NetReq');
            }
            const netreq = relay_data(build_net_req(spec));
            return send_net_req(netreq);
        },
        // withMeta(meta: Record<string, unknown>) {}
        // toLogin(){}
        // toUserProfile(){}
    };
}
;
//# sourceMappingURL=network-request.infra.js.map