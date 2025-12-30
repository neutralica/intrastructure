import type { ResultAsync } from "../outcome/result.types.js";
export type N_ReqMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'PATCH' | 'OPTIONS';
export declare enum NetRetryΔ {
    linear = "linear",
    exp = "exp",
    none = "none"
}
export interface FailRecoveryMode {
    retries: number;
    retryDelayMs: number;
    timeoutMs: number;
    strategy: NetRetryΔ;
}
export interface BaseSpec {
    method: N_ReqMethod;
    failBehavior: FailRecoveryMode;
}
export interface URLSpec extends BaseSpec {
    url: string;
}
export interface FailSpec extends BaseSpec {
    failBehavior: FailRecoveryMode;
}
export interface HeaderSpec extends BaseSpec {
    headers: Record<string, string>;
}
export interface QuerySpec extends BaseSpec {
    query: Record<string, string>;
}
export interface BodySpec<T> extends BaseSpec {
    body: T;
}
export interface JSONSpec extends BaseSpec {
    expectJSON: boolean;
}
export interface HTMLSpec extends BaseSpec {
    expectHTML: boolean;
}
export type JSONDiscriminant = {
    expectJSON: true;
    expectHTML: false;
};
export type HTMLDiscriminant = {
    expectJSON: false;
    expectHTML: true;
};
export type FullJSONRequest<T = unknown> = URLSpec & HeaderSpec & QuerySpec & BodySpec<T> & FailSpec & JSONDiscriminant;
export type FullHTMLRequest = URLSpec & HeaderSpec & QuerySpec & FailSpec & HTMLDiscriminant;
type NetRequestTEMP<T = unknown> = FullJSONRequest<T> | FullHTMLRequest;
export interface NetworkRequestSpec<T = unknown> {
    method: N_ReqMethod;
    url: string;
    failBehavior: FailRecoveryMode;
    headers?: Record<string, string>;
    query?: Record<string, unknown>;
    body?: T;
    expectJSON?: boolean;
    expectHTML?: boolean;
}
export type ValidNetRequest<S> = S extends NetRequestTEMP ? S : never;
export interface RequestBuilder<S> {
    getIngredView(): RequestBuilder<S & URLSpec & HTMLDiscriminant>;
    getGraph(): RequestBuilder<S & URLSpec & HTMLDiscriminant>;
    getHomeScreen(): RequestBuilder<S & URLSpec & HTMLDiscriminant>;
    getState(): RequestBuilder<S & URLSpec & JSONDiscriminant>;
    to(url: string): RequestBuilder<S & URLSpec & HTMLDiscriminant>;
    withHeaders(headers: Record<string, string>): RequestBuilder<S & HeaderSpec>;
    withQuery(query: Record<string, unknown>): RequestBuilder<S & QuerySpec>;
    withBody(body: unknown): RequestBuilder<S & BodySpec<S>>;
    onFailure(failBehavior: FailRecoveryMode): RequestBuilder<S & FailSpec>;
    asJSON(): RequestBuilder<S & JSONDiscriminant>;
    asText(): RequestBuilder<S & JSONSpec>;
    asHTML(element?: string): RequestBuilder<S & HTMLDiscriminant>;
    SEND(): ResultAsync<NetResponse>;
}
interface ReqBuilderInternal {
    extractElement?: string;
}
export interface NetResponse {
    spec: NetworkRequestSpec & ReqBuilderInternal;
    res: Response;
}
export type N_partial = Partial<NetworkRequestSpec> & Partial<ReqBuilderInternal>;
export type N_request<S> = N_partial & RequestBuilder<S> & ReqBuilderInternal;
export interface NetRequestFull {
    url: string;
    init: RequestInit;
    spec: NetworkRequestSpec & ReqBuilderInternal;
}
export interface NetRequestMethod<S> {
    GET(): N_request<S>;
    POST(): N_request<S>;
    PUT(): N_request<S>;
    DELETE(): N_request<S>;
}
export {};
//# sourceMappingURL=net-request.types.d.ts.map