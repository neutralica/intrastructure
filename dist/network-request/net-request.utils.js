// send-http.ts
import { format_err } from "../helpers/format-err.js";
import { outcomeIs } from "../outcome/outcome.infra.js";
import { r_$ } from "../outcome/outcome.wrappers.js";
export default function Build_NetRequest(spec) {
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
    return outcomeIs.OK({
        url: fullURL,
        init,
        spec: spec
    });
}
export async function Send_NetRequest(req) {
    try {
        const policy = req.spec.failBehavior;
        if (!policy) {
            return outcomeIs.ERR('could not get policy');
        }
        const fetchOnce = () => withTimeout(fetch(req.url, req.init), policy.timeoutMs);
        const res = await retry(fetchOnce, policy.retries, policy.retryDelayMs);
        const r_status = r_$(checkResponseStatus(res));
        if (r_status !== 'ok') {
            return outcomeIs.ERR(`response not OK: ${r_status}`);
        }
        const spec = req.spec;
        return outcomeIs.OK({ spec, res });
    }
    catch (error) {
        console.error(format_err(error));
        return outcomeIs.ERR(format_err(error));
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
 * check response status code
 */
export function checkResponseStatus(response) {
    if (response.status === 204) {
        return outcomeIs.ERR('no content'); // Special handling for 204 No Content
    }
    else if (response.status >= 300 && response.status < 400) {
        return outcomeIs.ERR('redirect');
    }
    else if (response.status >= 400 && response.status < 500) {
        return outcomeIs.ERR('client error'); // Handle 4xx client errors
    }
    else if (response.status >= 500) {
        return outcomeIs.ERR('server error'); // Handle 5xx server errors
    }
    else if (!response.ok) {
        return outcomeIs.ERR('unknown error: !response.ok'); // Handle any non-OK responses
    }
    return outcomeIs.OK('ok'); // If everything is OK
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
        return outcomeIs.ERR('container not found');
    }
    return outcomeIs.OK(container);
}
export async function Validate_HTMLRes({ spec, res }) {
    void r_$(checkResponseStatus(res), 'check response status');
    if (!spec.extractElement) {
        return outcomeIs.ERR(`no element property given to extract`);
    }
    const r_html = r_$(await Parse_ExtractHTML(res, spec.extractElement), 'parse and extract response html');
    return outcomeIs.OK(r_html);
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