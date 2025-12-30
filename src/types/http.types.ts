// http.types.ts

// =======================
// Core primitives
// =======================

export type HttpMethod =
  | "GET" | "HEAD"
  | "POST" | "PUT" | "PATCH" | "DELETE"
  | "OPTIONS";

export type HeaderValue = string | string[] | undefined;
export type HeadersLike = Record<string, HeaderValue>;

export type NextLike = (err?: unknown) => void | Promise<void>;

// Query values are usually strings, arrays, or absent.
// Keep it simple and predictable.
export type QueryValue = string | string[] | undefined;
export type QueryLike = Record<string, QueryValue>;

export type ParamsLike = Record<string, string>;

// =======================
// Request shape
// =======================

export interface HttpRequestLike<
  TParams extends ParamsLike = ParamsLike,
  TQuery extends QueryLike = QueryLike,
  TBody = unknown
> {
  method?: HttpMethod | string;
  url?: string;
  path?: string;

  headers?: HeadersLike;

  params: TParams;
  query: TQuery;
  body: TBody;

  // Optional conveniences (Express has these; others may not)
  ip?: string;
  originalUrl?: string;
}

// Alias if you like the old name:
export type TypedRequest<
  TParams extends ParamsLike = ParamsLike,
  TQuery extends QueryLike = QueryLike,
  TBody = unknown
> = HttpRequestLike<TParams, TQuery, TBody>;

// =======================
// Minimal response shape (shared)
// =======================
//
// Keep this small: useful for generic server responses,
// and doesn't assume templating/redirects exist.

export interface HttpResponseLike {
  status(code: number): this;

  json(body: unknown): this;
  send(body: unknown): this;

  // optional header APIs (different servers expose different names)
  setHeader?(name: string, value: string): this;
  set?(name: string, value: string): this;

  end(): void;
}

// =======================
// Server / Express-ish response shape
// =======================
//
// Your `respond` helpers are explicitly server-framework oriented.
// This interface models the *capabilities* you use, without importing Express.

export interface HttpServerResponseLike extends HttpResponseLike {
  sendStatus(code: number): this;

  redirect(url: string, status?: number): this;

  render(view: string, locals?: Record<string, unknown>): this;
}

// =======================
// Handlers
// =======================

export type ReqResNextHandler<
  TParams extends ParamsLike = ParamsLike,
  TQuery extends QueryLike = QueryLike,
  TBody = unknown
> = (
  req: HttpRequestLike<TParams, TQuery, TBody>,
  res: HttpServerResponseLike,
  next: NextLike
) => void | Promise<void>;

// This is the one your Express-oriented `respond` module should use.
export type ServerReqResNextHandler<
  TParams extends ParamsLike = ParamsLike,
  TQuery extends QueryLike = QueryLike,
  TBody = unknown
> = (
  req: HttpRequestLike<TParams, TQuery, TBody>,
  res: HttpServerResponseLike,
  next: NextLike
) => void | Promise<void>;