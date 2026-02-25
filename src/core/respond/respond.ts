// respond.infra.ts

import { format_err } from "../../helpers/format-err.js";
import { relay } from "../outcome/relay.js";
import {
    NO_VAL,
    type Outcome,
    type OutcomeAsync,
    type OutcomeAsyncJSON,
    type OutcomeAsyncRender,
    type OutcomeAsyncSend,
    type OutcomeData,
} from "../outcome/outcome.types.js";
import type {
    HttpServerResponseLike,
    NextLike,
    ReqResNextHandler,
    TypedRequest,
} from "../../types/http.types.js";
import { outcome } from "../outcome/outcome.js";

export const respond = {
    json:
        <T>(fn: (req: TypedRequest) => OutcomeAsyncJSON<T>): ReqResNextHandler =>
            async (req, res, next): Promise<void> => {
                const oc = await checkOutcome(fn, req);

                // CHANGE: handle all three variants explicitly
                if (outcome.isData(oc)) {
                    res.json((oc as OutcomeData<T>).data);
                    return;
                }

                if (outcome.isOK(oc)) {
                    // CHANGE: decide your policy; 204 is common for "no content"
                    res.sendStatus(204);
                    return;
                }

                // CHANGE: failure => pass ErrReport to Express
                next(outcome.isErr);
            },

    send:
        (fn: (req: TypedRequest) => OutcomeAsyncSend): ReqResNextHandler =>
            async (req, res, next): Promise<void> => {
                const oc = await checkOutcome(fn, req);

                if (outcome.isOK(oc)) {
                    res.sendStatus(204);
                    return;
                }

                if (outcome.isErr(oc)) {
                    next(new Error("unexpected data payload in SEND"));
                    return;
                }

                next(oc.data);
            },

    render:
        <T extends Record<string, unknown>>(
            fn: (req: TypedRequest) => OutcomeAsyncRender<T>
        ): ReqResNextHandler =>
            async (req, res, next): Promise<void> => {
                const oc = await checkOutcome(fn, req);

                if (outcome.isData(oc)) {
                    // CHANGE: after relai.is.data, outcome.data is NOT NO_VAL.
                    // Still need to defend against null because typeof null === "object".
                    const payload = (oc).data;

                    if (
                        typeof payload === "object" &&
                        payload !== null &&
                        "view" in payload &&
                        typeof (payload as any).view === "string"
                    ) {
                        // CHANGE: safe destructure with a cast after runtime validation
                        const { view, ...locals } = payload as { view: string } & T;
                        res.render(view, locals);
                        return;
                    }

                    next(new Error("data payload misconfigured for RNDR"));
                    return;
                }

                if (outcome.isOK(oc)) {
                    next(new Error("cannot find required data"));
                    return;
                }

                next(oc.err);
            },

    auth:
        (fn: (req: TypedRequest) => OutcomeAsyncSend): ReqResNextHandler =>
            async (req, res): Promise<void> => {
                const oc = await checkOutcome(fn, req);

                // CHANGE: always return after redirect (Express will still work without it,
                // but returns make control flow unambiguous)
                if (outcome.isOK(oc)) {
                    res.redirect("/");
                    return;
                }

                res.redirect("/auth/login");
            },
};


const checkOutcome = async <R>(
  fn: (req: TypedRequest) => OutcomeAsync<R>,
  req: TypedRequest
): Promise<Outcome<R>> => {
  try {
    const oc = await fn(req);
    return oc ?? relay.err("processed function returned undefined");
  } catch (e) {
    return relay.err("Unhandled exception in request handler", e);
  }
};