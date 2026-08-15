# Type-Aware Failure Modes

This fixture separates setup failures from intentional lint failures. Do not
fix or suppress the annotated diagnostics in `../src`.

## Missing `oxlint-tsgolint`

**Class:** missing consumer-owned type-aware engine.

**Symptom:** Oxlint cannot load or run the stable built-in type-aware rules.

**Remediation:** add `oxlint-tsgolint` to the consuming project's development
dependencies and reinstall there. It is intentionally not a dependency of
`@opsydyn/oxlint-effect`.

## Invalid TypeScript Project

**Class:** malformed or TypeScript-incompatible `tsconfig.json`.

**Symptom:** type-aware analysis cannot construct the configured TypeScript
project, or reports configuration diagnostics instead of the intended rule
IDs.

**Remediation:** correct the project configuration for the consumer's installed
TypeScript version. Keep module and module-resolution settings compatible, and
include only the intended consumer sources.

## Missing Monorepo Declarations

**Class:** incomplete dependency declarations.

**Symptom:** module resolution fails because a referenced workspace package has
not produced or exposed its `.d.ts` files.

**Remediation:** build the dependent package and expose its declarations through
its package metadata. Do not weaken the lint rules or add unrelated root
dependencies.

## Nested Type-Aware Option

**Class:** incorrect Oxlint configuration scope.

**Symptom:** built-in type-aware rules do not execute even though a nested
configuration has `options.typeAware`.

**Remediation:** set `options: { typeAware: true }` at the root resolved
configuration, as the `typeAware` preset does.

## Lint Failures Versus Compiler Diagnostics

**Class:** expected policy violation versus TypeScript project error.

**Symptom:** `typescript/no-floating-promises` and
`typescript/no-misused-promises` are lint diagnostics; `tsc` errors originate
from compiler semantics or project setup.

**Remediation:** run `bun run typecheck` to correct project configuration, then
run `bun run lint` to inspect type-aware policy violations. The deliberate
failure files make the latter command exit non-zero.

## Valid Controls

`../src/valid-controls.ts` has no `EXPECT` annotations and should report no
expected IDs. Verify it separately with `bun run lint:valid`; a diagnostic there
is a regression in the configuration, rule selection, or control code.
