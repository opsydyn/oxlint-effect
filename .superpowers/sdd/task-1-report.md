# Task 1 Report: Shared Path Options And Node Platform Import Rule

## Commit

`112bae24e8664e90e8a9ecf86d9015eefcd1e89b` - `Add Node platform boundary rule`

## Files Changed

- `src/index.ts`
  - Added configurable boundary-path helpers with `*` and `**` matching against absolute or relative filename segments.
  - Added the `boundaryPaths` options schema with no `defaultOptions`, retaining helper-owned replacement semantics for a supplied custom array.
  - Added the AST-only `linteffect/no-node-platform-in-shared-code` static-import rule, with explicit Node bare built-ins plus `node:*` detection.
  - Registered the rule and added it to the platform-and-boundary hygiene group, which flows into `recommended` through `allRules`.
- `tests/plugin.test.ts`
  - Extended the direct-rule harness with filename and options input.
  - Added coverage for shared and server paths, bare built-ins, non-Node packages, `src/main.ts`, `*`, `**`, and custom array replacement.
- `tests/config.test.ts`
  - Updated the exact recommended-rule and platform-group expectations.

## Tests Run

- `bun test tests/plugin.test.ts --test-name-pattern no-node-platform-in-shared-code`
  - RED before implementation: 4 failures because the rule was not exported.
  - GREEN after implementation: 5 passing tests, 0 failures.
- `bun test tests/config.test.ts`
  - 4 passing tests, 0 failures.
- `bun run test`
  - 267 passing tests, 0 failures.
- `bun run typecheck`
  - Passed.
- `bun run build`
  - Passed.
- `git diff --check`
  - Passed.

## Self-Review

- The rule only visits `ImportDeclaration`; it performs no module resolution, type, alias, require, or dynamic-import analysis.
- `node:*` is always treated as a Node platform import, while bare sources are matched only against the explicit builtin set; `node-fetch` remains allowed.
- The schema accepts only `boundaryPaths: string[]` and has no metadata default options. A valid custom array replaces defaults, including an empty array.
- Default patterns preserve the stated application boundaries, including `**/main.ts`; therefore `src/main.ts` is intentionally allowed.
- The commit includes only the three task-source/test files and no changeset.

## Concern

An unscoped `bun test` also executes `examples/npm-consumer/src/domain.ts` and fails because that existing fixture references declared-but-undefined runtime values. The package test script intentionally scopes to `./tests/*.test.ts` and passes; the failing example fixture was not changed by this task.

## Review Fix Report

### Finding

The standalone custom boundary pattern `**` did not have explicit whole-path matching semantics. Its generated expression relied on an optional prefix and could only describe an empty suffix rather than directly representing every normalised filename.

### Fix

- Updated `globToRegExp()` to return an explicit whole-string matcher for the normalised pattern `**`.
- Added a direct rule regression beside the existing custom replacement test: `boundaryPaths: ["**"]` allows `/repo/src/domain/order.ts` while the same custom replacement still rejects `/repo/server/http.ts`.
- No other path-pattern branches or boundary replacement behaviour were changed.

### Verification

- `bun test tests/plugin.test.ts --test-name-pattern no-node-platform-in-shared-code` - 5 passing, 0 failing.
- `bun test tests/config.test.ts` - 4 passing, 0 failing.
- `git diff --check` - passed.

### Commit

Committed in this worktree; the final commit hash is returned with this report.

### Concerns

None for the requested Task 1 finding. Broader repository checks were not rerun because the request was limited to the focused plugin test, `tests/config.test.ts`, and `git diff --check`.
