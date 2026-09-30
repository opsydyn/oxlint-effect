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

## Verify And Report

Run the consumer's lint and typecheck commands plus relevant behavioural tests.
Check that the original diagnostic is resolved without creating another one.
Report changes, commands/results, and any remaining uncertainty. A clean lint
run does not prove correct domain semantics or resource/concurrency safety.

Files annotated with `EXPECT` and `QA` may be intentional failure corpora. Preserve
their failures unless updating those examples is the task. Verify expected
diagnostics separately from clean controls; never fix the corpus just to make
the repository's example lint command exit zero.
