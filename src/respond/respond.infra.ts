// respond.infra.ts

import { ƒ_formatErr } from "../helpers/format-err.js";
import { $r } from "../outcome/result.infra.js";
import { NO_VAL, type R_asyncJSON, type R_asyncRNDR, type R_asyncSEND, type ResultAsync } from "../outcome/result.types.js";
import type {  HttpServerResponseLike, NextLike, ReqResNextHandler, TypedRequest } from "../types/http.types.js";


export const respond = {
    JSON: <T>(fn: (req: TypedRequest) => R_asyncJSON<T>): ReqResNextHandler =>
        async (req, res, next): Promise<void> => {
            const result = await processResult(fn, req, res, next);
            if ($r.has_data(result)) {
                res.json(result.data);

                return;
            }
            next(result.err);
        },

    SEND: (fn: (req: TypedRequest) => R_asyncSEND): ReqResNextHandler =>
        async (req, res, next): Promise<void> => {
            const result = await processResult(fn, req, res, next);
            if ($r.is_ok(result)) {
                res.sendStatus(204);

                return;
            }
            if ($r.has_data(result)) {
                next(new Error('unexpected data payload in SEND'));

                return;
            }
            next(result.err);
        },

    // createa a RenderPayload type that consolidates all the checks in the if typeof etc
    // conditional below and simplifies 
    RNDR: <T extends Record<string, unknown>>(
        fn: (req: TypedRequest) => R_asyncRNDR<T>): ReqResNextHandler =>
        async (req, res, next): Promise<void> => {
            const result = await processResult(fn, req, res, next);
            if ($r.has_data(result)) {
                if (typeof result.data === 'object' &&
                    result.data != NO_VAL &&
                    'view' in result.data &&
                    typeof result.data.view === 'string') {
                    const { view, ...locals } = result.data;
                    res.render(view, locals);

                    return;
                }
                next(new Error('data payload misconfigured for RNDR'));

                return;
            }
            if ($r.is_ok(result)) {
                next(new Error('cannot find required data'));

                return;
            }
            if ($r.is_xx(result)) {
                next(result.err);
            }
        },

    AUTH: (fn: (req: TypedRequest) => R_asyncSEND): ReqResNextHandler => 
        async (req, res, next) => {
            const result = await processResult(fn, req, res, next);
            if ($r.is_ok(result)) {
                console.log('debug — OK!');
                res.redirect('/');
            } else {
                res.redirect('/auth/login');
            }

        }
    
};

const processResult = async (
    fn: (req: TypedRequest) => ResultAsync<unknown>,
    req: TypedRequest,
    res: HttpServerResponseLike,
    next: NextLike
) => {
    try {
        const result = await fn(req) ?? $r.XX('processed function returned undefined');


        return result;
    } catch (error) {
        return $r.XX(ƒ_formatErr(error));
    }
};
