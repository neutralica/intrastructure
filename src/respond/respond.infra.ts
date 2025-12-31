// respond.infra.ts

import { format_err } from "../helpers/format-err.js";
import { outcomeIs } from "../outcome/outcome.infra.js";
import { NO_VAL, type OutcomeAsyncJSON, type OutcomeAsyncRender, type OutcomeAsyncSend, type OutcomeAsync } from "../outcome/outcome.types.js";
import type {  HttpServerResponseLike, NextLike, ReqResNextHandler, TypedRequest } from "../types/http.types.js";


export const respond = {
    json: <T>(fn: (req: TypedRequest) => OutcomeAsyncJSON<T>): ReqResNextHandler =>
        async (req, res, next): Promise<void> => {
            const outcome = await checkOutcome(fn, req, res, next);
            if (outcomeIs.dataOutcome(outcome)) {
                res.json(outcome.data);

                return;
            }
            next(outcome.err);
        },

    send: (fn: (req: TypedRequest) => OutcomeAsyncSend): ReqResNextHandler =>
        async (req, res, next): Promise<void> => {
            const outcome = await checkOutcome(fn, req, res, next);
            if (outcomeIs.successOnly(outcome)) {
                res.sendStatus(204);

                return;
            }
            if (outcomeIs.dataOutcome(outcome)) {
                next(new Error('unexpected data payload in SEND'));

                return;
            }
            next(outcome.err);
        },

    // createa a RenderPayload type that consolidates all the checks in the if typeof etc
    // conditional below and simplifies 
    render: <T extends Record<string, unknown>>(
        fn: (req: TypedRequest) => OutcomeAsyncRender<T>): ReqResNextHandler =>
        async (req, res, next): Promise<void> => {
            const outcome = await checkOutcome(fn, req, res, next);
            if (outcomeIs.dataOutcome(outcome)) {
                if (typeof outcome.data === 'object' &&
                    outcome.data != NO_VAL &&
                    'view' in outcome.data &&
                    typeof outcome.data.view === 'string') {
                    const { view, ...locals } = outcome.data;
                    res.render(view, locals);

                    return;
                }
                next(new Error('data payload misconfigured for RNDR'));

                return;
            }
            if (outcomeIs.successOnly(outcome)) {
                next(new Error('cannot find required data'));

                return;
            }
            if (outcomeIs.failErr(outcome)) {
                next(outcome.err);
            }
        },

    auth: (fn: (req: TypedRequest) => OutcomeAsyncSend): ReqResNextHandler => 
        async (req, res, next) => {
            const outcome = await checkOutcome(fn, req, res, next);
            if (outcomeIs.successOnly(outcome)) {
                console.log('debug — OK!');
                res.redirect('/');
            } else {
                res.redirect('/auth/login');
            }

        }
    
};

const checkOutcome = async (
    fn: (req: TypedRequest) => OutcomeAsync<unknown>,
    req: TypedRequest,
    res: HttpServerResponseLike,
    next: NextLike
) => {
    try {
        const outcome = await fn(req) ?? outcomeIs.ERR('processed function returned undefined');


        return outcome;
    } catch (error) {
        return outcomeIs.ERR(format_err(error));
    }
};
