// format-err.ts

export function ƒ_formatErr(err: unknown): string{

    if (err instanceof Error) {
        return err.message;
    }

    if (typeof err === 'string') {
        return  err ;
    }

    if (err && typeof err === 'object') {
        return JSON.stringify(err);
    }

    return 'unknown error' ;
}