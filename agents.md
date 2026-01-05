# agents.md

This repository contains Intrastructure (Outcome, ErrReport, wrappers).
Agents must preserve semantic clarity and error invariants.

## 1. Outcome invariants (do not break)

- Outcome<T> has exactly three variants:
  - data success
  - void success
  - error
- OutcomeSuccessOnly MUST use data: NO_VAL and __only: true.
- OutcomeFailErr MUST contain err instanceof ErrReport and __fail: true.

## 2. Separation of concerns

- relay.* creates Outcomes (constructors only).
- outcome.* inspects Outcomes (predicates only).
- Do NOT mix constructors and predicates in the same namespace.

## 3. Error handling rules

- relay.err is the primary coercion boundary for unknown causes.
- enrichOutcome MUST NOT create new ErrReports.
- addMessage mutates human-readable messages.
- addTrace mutates metadata only.

## 4. TypeScript constraints

- Prefer union types + external type guards.
- Avoid method bags on Outcome values.
- Avoid clever generic gymnastics unless strictly necessary.

## 5. Wrappers

- try_* wrappers normalize boundaries.
- wrap_* wrappers may throw ErrReport intentionally.
- Do NOT add new wrapper layers without strong justification.

## 6. Scope discipline

- Intrastructure is infrastructure, not application logic.
- Do not import UI, DOM, or browser-specific APIs.
- Do not add logging sinks or global handlers unless explicitly requested.