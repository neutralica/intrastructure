// network-request.infra.ts

import { relay } from "../outcome/relay.js";
import { relay_data } from "../outcome/relay.wrappers.js";
import { RetryPresetΔ } from "./net-request.consts.js";
import type { BodySpec, FailSpec, HeaderSpec, HTMLDiscriminant, HTMLSpec, JSONDiscriminant, JSONSpec, N_partial, N_request, NetworkRequestSpec, QuerySpec, RequestBuilder, URLSpec, FailRecoveryMode, NetRequestFull } from "./net-request.types.js";
import build_net_req, { send_net_req } from "./net-request.utils.js";

export const netReq = {
    NewNetRequest: () => ({
        GET: () => wrapNetReq({ method: 'GET', failBehavior: RetryPresetΔ.DEFAULT  as FailRecoveryMode}),
        POST: () => wrapNetReq({ method: 'POST', failBehavior: RetryPresetΔ.DEFAULT as FailRecoveryMode }),
        PUT: () => wrapNetReq({ method: 'PUT', failBehavior: RetryPresetΔ.DEFAULT  as FailRecoveryMode}),
        DELETE: () => wrapNetReq({ method: 'DELETE', failBehavior: RetryPresetΔ.DEFAULT  as FailRecoveryMode}),
    }),
};

function isNetRequestSpec(spec: N_partial): spec is NetworkRequestSpec {
    return (
        typeof spec.url === 'string' &&
        typeof spec.method === 'string'
    );

}

function wrapNetReq<S extends Partial<NetworkRequestSpec>>(spec: S): N_request<S> {
    return {
        ...spec,

        to(url: string) {
            return wrapNetReq({
                ...spec,
                url
                // HTMLDiscriminant as a catch all is not correct for all cases TODO
            }) as N_request<S & URLSpec & HTMLDiscriminant>;
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
            }) as N_request<S & URLSpec & HTMLDiscriminant>;
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
            }) as N_request<S & URLSpec & HTMLDiscriminant>;
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
            }) as RequestBuilder<S & URLSpec & HTMLDiscriminant>;
        },
        getState() {
            return wrapNetReq({
                ...spec,
                url: '/api/status',
            }) as RequestBuilder<S & URLSpec & JSONDiscriminant>;
        },

        // requireMethod(m: N_ReqMethod) {
        //     return n_wrap({
        //         ...spec,
        //         method: m,
        //     });
        // },

        withQuery(query: Record<string, unknown>) {
            return wrapNetReq({
                ...spec,
                query: {
                    ...(query ?? {}),
                    ...query
                },
            }) as RequestBuilder<S & QuerySpec>;
        },

        withBody(body: unknown) {
            return wrapNetReq({
                ...spec,
                body
                // S may or may not be the correct generic here?
            }) as RequestBuilder<S & BodySpec<S>>;
        },

        withHeaders(headers: Record<string, string>) {
            return wrapNetReq({
                ...spec,
                headers: {
                    ...(spec.headers ?? {}),
                    ...headers
                }
            }) as RequestBuilder<S & HeaderSpec>;
        },

        // TODO - I notice asJSON and asHTML don't enforce return types
        asJSON() {
            return wrapNetReq({
                ...spec,
                expectJSON: true,
            }) as RequestBuilder<S & JSONSpec>;
        },

        asText() {
            return wrapNetReq({
                ...spec,
                expectJSON: false,
                // TODO— *not* JSONSPec
            }) as RequestBuilder<S & JSONSpec>;
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
            }) as RequestBuilder<S & HTMLSpec>;
        },

        onFailure(failBehavior: FailRecoveryMode) {
            return wrapNetReq({
                ...spec,
                failBehavior,


            }) as RequestBuilder<S & FailSpec>;
        },

        SEND() {
            if (!isNetRequestSpec(spec)) {
                // 'throw' required here rather than return (which errors) - investigate (todo)
                throw relay.err('no url or method on NetReq');
            }
            const netreq: NetRequestFull = relay_data(build_net_req(spec));
            return send_net_req(netreq);
        },
        // withMeta(meta: Record<string, unknown>) {}
        // toLogin(){}
        // toUserProfile(){}
    };
};
