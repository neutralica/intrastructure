// outcome.ts
import { NO_VAL } from "./outcome.types.js";
import ErrReport from "../error-report/error-report.js";
export const outcome = {
    isOutcome(x) {
        return typeof x === "object" && x !== null && "success" in x;
    },
    isData(o) {
        return o.success === true && o.data !== NO_VAL && o.data !== undefined;
    },
    isOK(o) {
        return o.success === true && o.__only === true && o.data === NO_VAL;
    },
    isErr(o) {
        return o.success === false && o.__fail === true && o.err instanceof ErrReport;
    },
};
//# sourceMappingURL=outcome.js.map