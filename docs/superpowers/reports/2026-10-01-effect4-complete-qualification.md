# Wider Effect Qualification Progress

Status: in progress; not a compatibility-completion or publication claim.
Baseline: b159eb8. Approved inline execution on main; no push or publish.

## Harness

- Case manifests validate registered rule, major, classification, nonempty
  variants, bad/clean sources and positive literal per-file warning counts.
- Unsafe, missing and external-symlink source paths fail qualification.
- Qualified inventory entries without cases fail the partial gate.
- The complete gate rejects the baseline inventory before installation.
- Four existing scoped rule qualifications migrated to isolated packed cases
  for both Effect 3.21.4 and 4.0.0, retaining prior mixed-policy/path probes.
- RED missing validation/CLI interfaces, then GREEN: 12 focused tests.
- Task 1 gates: 466 tests pass; root typecheck, both packed majors and separate
  packed type-aware consumer pass. No detector changes in this task.

## Batch Evidence

Q01: public error contracts qualified unchanged for both majors. Each rule has
five parsed warnings (named/default functions, arrow, typed callable, function
expression) and clean tagged unions/private/non-Effect controls. Tagged repairs
retain tag/userId at runtime and support catchTag recovery; a checked negative
type fixture rejects generic Error in the tagged public contract. No detector
change was necessary. Evidence is in each consumer's errorModeling group and
qualification manifest; synthetic report nodes are asserted too.

Q02: expected-state and empty-tag syntax qualified in both majors; the v4
expected-state repair now names Result rather than the removed Either API.
Domain exceptions cover 3 parsed legacy and 14 v4 callback forms, including
handler maps; unused nested functions stay clean in v4. Typed runtime controls
retain absence/presence, state payloads and original error causes. All 470 tests,
root types and both packed majors pass; build is 26.82 KB brotlied (27 KB cap).

The plan's Q01-Q52 table is the progress checklist. Wider groups remain open.

Q03: log-only recovery has 3 parsed legacy and 14 v4 warnings; v4 recovery
families and maps warn while failure-preserving observers stay clean. Runtime
contracts retain typed error identity and distinguish defects from failures.
Earlier plain recovery rules now cover catchEager in their packed v4 probes.
472 tests, both packed majors and root types pass; size remains under 27 KB.

## Rulings

V4 log-only policy excludes observers because the installed API preserves the
original failure; legacy tapError reporting is retained for compatibility.
This is a deliberate major-version policy distinction. Existing syntax-local
limits remain in force; this is not interprocedural recovery verification.
