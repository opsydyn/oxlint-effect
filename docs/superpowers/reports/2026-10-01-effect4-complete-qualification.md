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

No wider batch complete yet. The plan's Q01-Q52 table is the progress checklist.

## Rulings

None so far. Existing documented syntax limits remain in force.
