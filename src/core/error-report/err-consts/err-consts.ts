// log-error.enums.ts

export enum AlertLevel {
    INFO = 'info',
    WARN = 'warn',
    DEBUG = 'debug',
    ERROR = 'error',
}

export enum ErrSeverity {
    LOW = 'low',
    MED = 'medium',
    HIGH = 'high',
    CRIT = 'critical'
}

export enum ErrSource {
    CLIENT = 'client',
    SERVER = 'server',
    SYSTEM = 'system',
    UNKNOWN = 'unknown'
}
