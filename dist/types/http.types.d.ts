export type HttpMethod = "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
export type HeaderValue = string | string[] | undefined;
export type HeadersLike = Record<string, HeaderValue>;
export type NextLike = (err?: unknown) => void | Promise<void>;
export type QueryValue = string | string[] | undefined;
export type QueryLike = Record<string, QueryValue>;
export type ParamsLike = Record<string, string>;
export interface HttpRequestLike<TParams extends ParamsLike = ParamsLike, TQuery extends QueryLike = QueryLike, TBody = unknown> {
    method?: HttpMethod | string;
    url?: string;
    path?: string;
    headers?: HeadersLike;
    params: TParams;
    query: TQuery;
    body: TBody;
    ip?: string;
    originalUrl?: string;
}
export type TypedRequest<TParams extends ParamsLike = ParamsLike, TQuery extends QueryLike = QueryLike, TBody = unknown> = HttpRequestLike<TParams, TQuery, TBody>;
export interface HttpResponseLike {
    status(code: number): this;
    json(body: unknown): this;
    send(body: unknown): this;
    setHeader?(name: string, value: string): this;
    set?(name: string, value: string): this;
    end(): void;
}
export interface HttpServerResponseLike extends HttpResponseLike {
    sendStatus(code: number): this;
    redirect(url: string, status?: number): this;
    render(view: string, locals?: Record<string, unknown>): this;
}
export type ReqResNextHandler<TParams extends ParamsLike = ParamsLike, TQuery extends QueryLike = QueryLike, TBody = unknown> = (req: HttpRequestLike<TParams, TQuery, TBody>, res: HttpServerResponseLike, next: NextLike) => void | Promise<void>;
export type ServerReqResNextHandler<TParams extends ParamsLike = ParamsLike, TQuery extends QueryLike = QueryLike, TBody = unknown> = (req: HttpRequestLike<TParams, TQuery, TBody>, res: HttpServerResponseLike, next: NextLike) => void | Promise<void>;
//# sourceMappingURL=http.types.d.ts.map