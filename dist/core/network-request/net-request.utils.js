// send-http.ts
import { format_err } from "../../helpers/format-err.js";
import { relay } from "../outcome/relay.js";
import { wrap_data } from "../outcome/relay.wrappers.js";
import { outcome } from "../outcome/outcome.js";
export function checkResponseStatus(response) {
    if (!response.ok)
        return relay.err(`HTTP ${response.status}`);
    return relay.ok(); // success-only
}
export default function build_net_req(spec) {
    const { method, url, headers, query, body, expectJSON, } = spec;
    const fullURL = query
        ? `${url}?${new URLSearchParams(Object.entries(query)
            .filter(([_, val]) => val !== undefined && val !== null)
            .map(([key, val]) => [key, String(val)]))}`
        : url;
    const finalHeader = {
        ...(expectJSON
            ? { Accept: 'application/json' }
            : {}),
        ...(body && typeof body === 'object'
            ? { 'Content-Type': 'application/json' }
            : {}),
        ...headers,
    };
    const serializeBody = body && typeof body === 'object'
        ? JSON.stringify(body)
        : body;
    const init = {
        method,
        headers: finalHeader,
        body: method === 'GET' || method === 'HEAD'
            ? null
            : serializeBody,
    };
    return relay.data({
        url: fullURL,
        init,
        spec: spec
    });
}
export async function send_net_req(req) {
    try {
        const policy = req.spec.failBehavior;
        if (!policy) {
            return relay.err('could not get policy');
        }
        const fetchOnce = () => withTimeout(fetch(req.url, req.init), policy.timeoutMs);
        const res = await retry(fetchOnce, policy.retries, policy.retryDelayMs);
        const statusOk = checkResponseStatus(res);
        if (outcome.isErr(statusOk)) {
            // CHANGE: convert Outcome<void> failure into Outcome<NetResponse> failure
            return relay.err("response not OK", statusOk.err);
        }
        const spec = req.spec;
        return relay.data({ spec, res });
    }
    catch (error) {
        console.error(format_err(error));
        return relay.err(format_err(error));
    }
}
function withTimeout(task, ms) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(`timed out after ${ms} ms`));
        }, ms);
        task.then((value) => {
            clearTimeout(timeout);
            resolve(value);
        }).catch((err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
}
/**
 * parse response & find {(element)} within body
 * - accepts Response
 * - converts Response to plaintext
 * - parses to html
 * - queries html for element within html (usually '.response-container')
 * - returns element
 */
async function Parse_ExtractHTML(response, element) {
    const string = await response.text();
    const parser = new DOMParser;
    const html = parser.parseFromString(string, 'text/html');
    const container = html.querySelector(element);
    if (!(container instanceof HTMLElement)) {
        return relay.err('container not found');
    }
    return relay.data(container);
}
export async function validate_response({ spec, res }) {
    void wrap_data(checkResponseStatus(res), 'check response status');
    if (!spec.extractElement) {
        return relay.err(`no element property given to extract`);
    }
    const r_html = wrap_data(await Parse_ExtractHTML(res, spec.extractElement), 'parse and extract response html');
    return relay.data(r_html);
}
export async function retry(task, maxAttempts, delayMs = 0) {
    let lastErr;
    for (let i = 0; i < maxAttempts; i++) {
        try {
            return await task();
        }
        catch (error) {
            lastErr = error;
            if (i < (maxAttempts - 1) && delayMs > 0)
                await wait(delayMs);
        }
    }
    throw lastErr;
}
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//# sourceMappingURL=net-request.utils.js.map