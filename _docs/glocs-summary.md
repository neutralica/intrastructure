	•	Goal
	•	Build Glocs: a “literate tracing” system where comments are the authoring surface and runtime traces are emitted automatically (no ad-hoc logging), with a hard bias toward accurate or absent information.
	•	Eliminate “label rot” by making IDs/tooling own correctness, not human discipline.
	•	Core constraint
	•	Comments can’t see runtime values. To capture locals at runtime, you must either:
	•	inject code at build time, or
	•	manually write trace calls (less desirable).
	•	We’re choosing build-time code injection.
	•	High-level architecture
	•	_INTRA remains bottom-layer and does not depend on HSON.
	•	Glocs produces two outputs during build:
	1.	Docs Map artifact (static metadata; no runtime dependency)
	2.	Instrumented JS (injected runtime probes that emit events)
	•	Two-channel directive model
	•	Glocs comment DSL splits into:
	•	Doc-only directives (go only into the Docs Map)
	•	Runtime directives (compile into injected code that emits events)
	•	This avoids the “everything becomes logging” trap.
	•	Naming / marker convention
	•	Use an explicit marker prefix to avoid accidental capture:
	•	//@ as the canonical start of a gloc directive.
	•	Use verbosity markers that are human-friendly but still structured:
	•	//@. info level
	•	//@... higher verbosity (N dots = level N)
	•	//@! warn
	•	//@X error
	•	//@? debug / expectations
	•	Stable identity strategy (anti-rot)
	•	Each meaningful gloc “step” has an identity.
	•	Avoid function-name-derived IDs as the canonical identity (renames rot).
	•	Preferred approach: hybrid ID
	•	Author provides a short seed: //@id normalizeHeaders
	•	Tool generates a unique derived ID: normalizeHeaders#A7KQ
	•	suffix derived from AST context/hash for uniqueness
	•	seed provides human meaning and grouping
	•	Build fails if:
	•	an //@id is missing where required
	•	duplicate seeds collide in a scope
	•	runtime directives reference unknown IDs
	•	Attachment / placement semantics
	•	Glocs blocks can live:
	•	near function headers (overview)
	•	inline in execution order (chronological docs)
	•	Tool attaches each directive block to an AST node (not line numbers) to prevent positional rot:
	•	“this gloc block applies to the next statement/expression” (structural attachment)
	•	Runtime emission model (no console dependency)
	•	Define a tiny runtime emitter API in _INTRA:
	•	gloc.emit(event) (default no-op)
	•	optional gloc.sink = ... to attach sinks
	•	console.gloc is optional sugar only (dev sink alias), not foundational.
	•	Event schema (structured tracing)
	•	Runtime injection emits structured events, not strings:
	•	{ id, kind, level, ts, data, msg? }
	•	Kinds we’ve discussed:
	•	step (a point-in-time observation)
	•	spanStart / spanEnd (timed region)
	•	assert / warn (condition violated)
	•	expect (expected vs observed)
	•	Events should support correlation via existing _INTRA concepts if useful later (Result chains, ErrReport IDs).
	•	Docs Map artifact
	•	Produced by the build tool; consumed by the viewer (HSON/devtools).
	•	Keyed by generated step ID.
	•	Stores:
	•	narrative lines grouped by verbosity level
	•	severity-tagged notes (!, X, ?)
	•	optional structured metadata (e.g., “expected types”, “invariants”)
	•	Can be shipped as JSON (or HSON later), without _INTRA importing HSON.
	•	Runtime directives (compile to injected code)
	•	Minimum viable runtime directives:
	•	//@capture a, b, c
	•	injects gloc.emit({ id, kind:"step", data:{a,b,c} })
	•	//@assert expr (phase 2)
	•	injects conditional emission when assertion fails
	•	//@span name (phase 2)
	•	injects start/end events around a region
	•	Runtime directives must be scope-checked:
	•	build fails if you reference variables not in scope at the injection site.
	•	Build-time static checking (anti-rot via types)
	•	Use the TS compiler API to optionally gather:
	•	variables in scope
	•	inferred types
	•	“possibly undefined” warnings
	•	Provide doc-to-type consistency checks later:
	•	e.g., if a doc directive claims bar: TypeA but TS says TypeA | undefined, flag it.
	•	This makes docs “type-checked commentary” instead of drifting prose.
	•	Integration with outcome /ErrReport
	•	Remove stack-regex “origin” helpers from core (imprecise).
	•	Prefer explicit, sparse step IDs at boundaries:
	•	enrichOutcome(outcome, stepId) where stepId comes from glocs tooling or module constants
	•	Glocs runtime instrumentation can add breadcrumbs precisely without stack guessing.
	•	Scope boundaries / where to place IDs
	•	Don’t tag every helper.
	•	Tag only:
	•	boundary crossings
	•	meaning transformations
	•	catch/enrich sites
	•	“Last explicit tag wins” for context—no <anon> noise. Use spans/timing to reveal gaps.
	•	Implementation plan (actionable phases)
	•	Phase 0: Library hygiene
	•	keep _INTRA free of express/undici/qs type dependencies; use minimal “request/response shape” types
	•	keep ErrReport pure (no console logging, no stack spelunking helpers)
	•	Phase 1: MVP Glocs tool
	•	build-step parser:
	•	scan for //@ directives
	•	support //@id + //@.///@... doc lines
	•	support //@capture runtime directive
	•	AST attachment:
	•	map directive blocks to the next AST node within a function
	•	output artifacts:
	•	glocs.map.json (Docs Map)
	•	instrumented JS (or TS transform) with injected gloc.emit(...) calls
	•	Phase 2: Robustness
	•	scope validation: ensure captured vars exist in scope; fail build on mismatch
	•	hybrid ID generation and collision detection
	•	enable/disable switch:
	•	gloc.emit no-op by default; enable by attaching a sink
	•	Phase 3: Expressiveness
	•	//@assert with conditional emission
	•	//@span timed regions
	•	//@expect expected vs observed events
	•	optional type-based linting for doc claims
	•	Phase 4: Viewer
	•	in HSON/devtools: render events + narrative:
	•	foldable by verbosity
	•	keyed by step IDs
	•	shows captured runtime values alongside the prose
	•	keep viewer separate from _INTRA to avoid circular deps.
	•	Non-goals (for now)
	•	No attempt to infer “true caller” via stack parsing.
	•	No reliance on decorators for statement-level instrumentation.
	•	No requirement that console exists; console integration is optional.
	•	Success criteria
	•	Glocs can:
	•	emit structured runtime events at precise points, capturing locals
	•	display a narrative trace that aligns with execution order
	•	fail builds when directives drift out of scope or IDs collide
	•	keep _INTRA clean and one-way (HSON adapts; no circular imports)