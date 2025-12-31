// format-err.ts
export function format_err(err) {
    if (err instanceof Error) {
        return err.message;
    }
    if (typeof err === 'string') {
        return err;
    }
    if (err && typeof err === 'object') {
        return JSON.stringify(err);
    }
    return 'unknown error';
}
//# sourceMappingURL=format-err.js.map