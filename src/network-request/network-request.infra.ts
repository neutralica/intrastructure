// network-request.infra.ts

import { $r } from "../outcome/result.infra.js";
import { r_$ } from "../outcome/result.wrappers.js";
import { RetryPresetΔ } from "./net-request.consts.js";
import type { BodySpec, FailSpec, HeaderSpec, HTMLDiscriminant, HTMLSpec, JSONDiscriminant, JSONSpec, N_partial, N_request, NetworkRequestSpec, QuerySpec, RequestBuilder, URLSpec, FailRecoveryMode } from "./net-request.types.js";
import Build_NetRequest, { Send_NetRequest } from "./net-request.utils.js";

export const $n = {
    NewNetRequest: () => ({
        GET: () => n_wrap({ method: 'GET', failBehavior: RetryPresetΔ.DEFAULT  as FailRecoveryMode}),
        POST: () => n_wrap({ method: 'POST', failBehavior: RetryPresetΔ.DEFAULT as FailRecoveryMode }),
        PUT: () => n_wrap({ method: 'PUT', failBehavior: RetryPresetΔ.DEFAULT  as FailRecoveryMode}),
        DELETE: () => n_wrap({ method: 'DELETE', failBehavior: RetryPresetΔ.DEFAULT  as FailRecoveryMode}),
    }),
};

function isNetRequestSpec(spec: N_partial): spec is NetworkRequestSpec {
    return (
        typeof spec.url === 'string' &&
        typeof spec.method === 'string'
    );

}

function n_wrap<S extends Partial<NetworkRequestSpec>>(spec: S): N_request<S> {
    return {
        ...spec,

        to(url: string) {
            return n_wrap({
                ...spec,
                url
                // HTMLDiscriminant as a catch all is not correct for all cases TODO
            }) as N_request<S & URLSpec & HTMLDiscriminant>;
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
            }) as N_request<S & URLSpec & HTMLDiscriminant>;
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
            }) as N_request<S & URLSpec & HTMLDiscriminant>;
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
            }) as RequestBuilder<S & URLSpec & HTMLDiscriminant>;
        },
        getState() {
            return n_wrap({
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
            return n_wrap({
                ...spec,
                query: {
                    ...(query ?? {}),
                    ...query
                },
            }) as RequestBuilder<S & QuerySpec>;
        },

        withBody(body: unknown) {
            return n_wrap({
                ...spec,
                body
                // S may or may not be the correct generic here?
            }) as RequestBuilder<S & BodySpec<S>>;
        },

        withHeaders(headers: Record<string, string>) {
            return n_wrap({
                ...spec,
                headers: {
                    ...(spec.headers ?? {}),
                    ...headers
                }
            }) as RequestBuilder<S & HeaderSpec>;
        },

        // TODO - I notice asJSON and asHTML don't enforce return types
        asJSON() {
            return n_wrap({
                ...spec,
                expectJSON: true,
            }) as RequestBuilder<S & JSONSpec>;
        },

        asText() {
            return n_wrap({
                ...spec,
                expectJSON: false,
                // TODO— *not* JSONSPec
            }) as RequestBuilder<S & JSONSpec>;
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
            }) as RequestBuilder<S & HTMLSpec>;
        },

        onFailure(failBehavior: FailRecoveryMode) {
            return n_wrap({
                ...spec,
                failBehavior,


            }) as RequestBuilder<S & FailSpec>;
        },

        SEND() {
            if (!isNetRequestSpec(spec)) {
                // 'throw' required here rather than return (which errors) - investigate (todo)
                throw $r.XX('no url or method on NetReq');
            }
            const r_netreq = r_$(Build_NetRequest(spec));
            return Send_NetRequest(r_netreq);
        },
        // withMeta(meta: Record<string, unknown>) {}
        // toLogin(){}
        // toUserProfile(){}
    };
};
