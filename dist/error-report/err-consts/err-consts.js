// log-error.enums.ts
export var AlertLevel;
(function (AlertLevel) {
    AlertLevel["INFO"] = "info";
    AlertLevel["WARN"] = "warn";
    AlertLevel["DEBUG"] = "debug";
    AlertLevel["ERROR"] = "error";
})(AlertLevel || (AlertLevel = {}));
export var ErrSeverity;
(function (ErrSeverity) {
    ErrSeverity["LOW"] = "low";
    ErrSeverity["MED"] = "medium";
    ErrSeverity["HIGH"] = "high";
    ErrSeverity["CRIT"] = "critical";
})(ErrSeverity || (ErrSeverity = {}));
export var ErrSource;
(function (ErrSource) {
    ErrSource["CLIENT"] = "client";
    ErrSource["SERVER"] = "server";
    ErrSource["SYSTEM"] = "system";
    ErrSource["UNKNOWN"] = "unknown";
})(ErrSource || (ErrSource = {}));
//# sourceMappingURL=err-consts.js.map