// respond.infra.ts
import { format_err } from "../helpers/format-err.js";
import { relai } from "../outcome/relai.js";
import { NO_VAL } from "../outcome/outcome.types.js";
export const respond = {
    json: (fn) => async (req, res, next) => {
        const outcome = await checkOutcome(fn, req, res, next);
        if (relai.data(outcome)) {
            res.json(outcome.data);
            return;
        }
        next(outcome.err);
    },
    send: (fn) => async (req, res, next) => {
        const outcome = await checkOutcome(fn, req, res, next);
        if (relai.successOnly(outcome)) {
            res.sendStatus(204);
            return;
        }
        if (relai.data(outcome)) {
            next(new Error('unexpected data payload in SEND'));
            return;
        }
        next(outcome.err);
    },
    // createa a RenderPayload type that consolidates all the checks in the if typeof etc
    // conditional below and simplifies 
    render: (fn) => async (req, res, next) => {
        const outcome = await checkOutcome(fn, req, res, next);
        if (relai.data(outcome)) {
            if (typeof outcome.data === 'object' &&
                outcome.data != undefined &&
                'view' in outcome.data &&
                typeof outcome.data.view === 'string') {
                const { view, ...locals } = outcome.data;
                res.render(view, locals);
                return;
            }
            next(new Error('data payload misconfigured for RNDR'));
            return;
        }
        if (relai.successOnly(outcome)) {
            next(new Error('cannot find required data'));
            return;
        }
        if (relai.failErr(outcome)) {
            next(outcome.err);
        }
    },
    auth: (fn) => async (req, res, next) => {
        const outcome = await checkOutcome(fn, req, res, next);
        if (relai.successOnly(outcome)) {
            console.log('debug — OK!');
            res.redirect('/');
        }
        else {
            res.redirect('/auth/login');
        }
    }
};
const checkOutcome = async (fn, req, res, next) => {
    try {
        const outcome = await fn(req) ?? relai.err('processed function returned undefined');
        return outcome;
    }
    catch (error) {
        return relai.err(format_err(error));
    }
};
//# sourceMappingURL=respond.infra.js.map