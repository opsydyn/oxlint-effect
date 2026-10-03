---
name: oxlint-effect
description: Use when configuring @opsydyn/oxlint-effect, investigating linteffect diagnostics, or repairing Effect domain-modeling and error-modeling code in a consuming project.
---

# Oxlint Effect

Use the installed npm package as the rule implementation. This skill provides
configuration and domain-modeling guidance; it does not vendor or replace rules.

## Establish the Consumer Contract

Read the repository instructions, working-tree changes, package manifests,
lockfile, and resolved Oxlint configuration. Identify the relevant workspace,
package manager, installed Effect/Oxlint/plugin versions, selected presets,
overrides, and lint/typecheck commands. Match guidance to those installed
versions. A skill obtained from GitHub may describe exports newer than the
consumer package; verify exports before adding them.

This unreleased 2.0 checkout defaults to Effect 4. Published 1.x remains Effect 3.
For every group, consult [versioned rule guidance](references/versioned-rules.md)
and the matching pinned consumer's annotated failures, repairs and scope notes.
Legacy uses `effect3`; manual sensitive rules default to 4. Do not mix a legacy
repair with current APIs merely because the rule ID is stable.

## Choose The Matching Corpus

Effect 4 assets are first-class and verified with the pinned current dependency:

- Identifiers and failures: [bad](assets/effect4/domain.bad.ts), [good](assets/effect4/domain.good.ts).
- Commands, units and options: [bad](assets/effect4/domain-shapes.bad.ts), [good](assets/effect4/domain-shapes.good.ts).
- Vocabulary and lifecycles: [bad](assets/effect4/domain-decisions.bad.ts), [good](assets/effect4/domain-decisions.good.ts).
- Context and clock: [bad](assets/effect4/domain-context.bad.ts), [good](assets/effect4/domain-context.good.ts).
- Public error channels: [bad](assets/effect4/public-errors.bad.ts), [good](assets/effect4/public-errors.good.ts).
- Error identity: [bad](assets/effect4/error-preservation.bad.ts), [good](assets/effect4/error-preservation.good.ts).
- Expected state: [bad](assets/effect4/expected-state.bad.ts), [good](assets/effect4/expected-state.good.ts).

The original assets below are explicitly **legacy Effect 3**. Retain them for
legacy consumers; use the current counterparts above for Effect 4. Both corpora
are packed, typechecked, linted and runtime-tested against their matching major.
These are executable contract checks, not proof of an agent's live adherence.

## Configure

Read [configuration](references/configuration.md) when installing, upgrading,
selecting a group, or enabling type-aware linting. Preserve existing plugins,
rules, overrides, ignore patterns, and package-manager conventions. Choose the
requested policy, register this plugin once, and validate the resolved config.
Do not enable every group merely because it is available.

## Diagnose Or Repair Domain Code

Read [domain modeling](references/domain-modeling.md) for DDD warnings. Identify
the exact rule ID, source span, enabled policy, and surrounding domain contract.
Separate what the syntax detector observed from what the application actually
requires. Explain a potential false positive rather than treating a warning as
proof of incorrect business behaviour.

For assessment requests, report findings without editing. For requested repairs,
make the smallest change that expresses the domain invariant. Reuse existing
brands, schemas, errors, constructors, and services. Preserve boundary formats,
error handling, state transitions, and caller behaviour; include necessary
call-site changes in the same repair. Do not invent business rules, rename symbols
to evade detection, add casts, or suppress diagnostics to obtain a clean run.

The paired [failures](assets/domain.bad.ts) and [repairs](assets/domain.good.ts)
cover identifiers, behaviour modes, and structured failures. They are examples,
not replacements to copy over a consumer's model. Verify APIs against the
consumer's Effect version before adapting them.

For primitive-heavy commands, time fields, and overloaded options, read the
[domain shapes failures](assets/domain-shapes.bad.ts) with their
[repairs](assets/domain-shapes.good.ts). Keep wire units, optional-field
semantics, and boundary validation policy explicit.

For status vocabulary, business predicates, and lifecycle flags, read
[domain decisions](references/domain-decisions.md) and its paired examples.
Establish valid states and transitions from the consumer's contract before
replacing flags with a tagged union.

For explicit policy context, clock ownership, and empty error payloads, read
[domain context](references/domain-context.md) and its paired examples. Distinguish
typed identity from authority, time conversion from clock reads, and expected
state from failure before changing a consumer's contract.

For generic, unknown, or mixed public Effect error channels, read
[public errors](references/public-errors.md) and its paired examples. Preserve
original failure details, migrate callers with the error representation, and
keep defects and interruptions distinct from typed failures.

For message-only failures, generic rethrows, or log-only handlers, read
[error preservation](references/error-preservation.md). Establish recovery
ownership and distinguish `catchAll` from `tapError` before changing semantics.
For current Effect use the versioned guide: broad `catch`/`catchEager` differs
from failure-preserving observers, and legacy `catch` is discriminator-specific.

For ordinary absence, broad null fallback, or thrown expected rejection, read
[expected state](references/expected-state.md). Classify the outcome with its
owner and migrate callers whenever the success or failure channel changes.

The paired corpus covers all exported DDD rules with representative failures
and passing controls; it does not prove every detection variant or agent repair.

## Verify And Report

Run the consumer's lint and typecheck commands plus relevant behavioural tests.
Check that the original diagnostic is resolved without creating another one.
Report changes, commands/results, and any remaining uncertainty. A clean lint
run does not prove correct domain semantics or resource/concurrency safety.

Files annotated with `EXPECT` and `QA` may be intentional failure corpora. Preserve
their failures unless updating those examples is the task. Verify expected
diagnostics separately from clean controls; never fix the corpus just to make
the repository's example lint command exit zero.
