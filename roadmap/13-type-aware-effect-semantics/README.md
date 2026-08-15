# 13 Type-Aware Effect Semantics

This group records the opt-in bridge to [Oxc type-aware
linting](https://oxc.rs/docs/guide/usage/linter/type-aware.html) and the
deferred semantic Effect work it makes possible. `@opsydyn/oxlint-effect`
remains an ESLint-compatible JavaScript plugin with syntax-only rules. Oxc's
[JavaScript plugin API](https://oxc.rs/docs/guide/usage/linter/js-plugins.html)
does not currently support custom type-aware rules.

EffectPatterns informs the candidate contracts below, especially its public
error-channel, service architecture, and scope/lifetime guidance. This roadmap
does not add an initial lint rule, so it has no entry in
`docs/rule-qa-inventory.json`.

## Initial Bridge Checklist

- [x] Export an opt-in `typeAware` configuration with only
  `options.typeAware: true`.
- [x] Add an isolated TypeScript 7 consumer fixture with intentional failures
  and clean controls.
- [x] Verify packed-package consumption and exact expected diagnostics.
- [x] Document public configuration variants, controls, and failure classes.
- [ ] Add a dedicated CI gate for the pack-backed typed consumer after Task 5
  lands.
- [ ] Obtain supported Oxc custom typed-plugin access before implementing
  semantic `linteffect/*` rules.

`recommended` remains unchanged. The initial bridge enables Oxc's engine but
does not make custom Effect rules type-aware.

## API Gate

Before semantic rule implementation begins, Oxc must expose a supported API
that provides resolved TypeScript types or symbols to custom rules, handles
aliases, imports, re-exports, and inferred return types, uses the same project
as type-aware linting, provides stable diagnostic locations and registration,
and does not require a second TypeScript program.

Until this gate is satisfied, the work below remains roadmap and upstream
tracking rather than implemented rule behaviour.

## Slice A: Public Effect Contracts

Use resolved types to improve public contracts across aliases and inferred
return types:

- `no-public-generic-effect-error`;
- `no-unknown-public-error-channel`;
- `no-service-method-returning-promise`.

Avoid duplicate diagnostics for a source span already covered by a syntax-only
rule. Preserve the existing syntax-only behaviour when `typeAware` is absent.

## Slice B: Service And Environment Contracts

Use Effect service and environment channels to evaluate:

- `no-missing-layer-provision-at-run`;
- `require-service-dependencies`;
- `no-run-effect-outside-boundary`.

Distinguish an unresolved service requirement from an `any` or unknown boundary,
and document the configuration for intentionally dynamic runtime composition.

## Slice C: Resource Ownership Research

Evaluate, without automatic promotion, typed versions of:

- `no-resource-succeed-escape`;
- `no-run-with-open-resource`;
- `no-acquire-without-scoped-release`.

TypeScript types alone do not prove runtime lifetimes. A rule may ship only
when the Effect API model gives enough evidence for scope ownership,
acquisition, and release.

## Non-Goals

- Constructing a duplicate TypeScript program through the compiler API,
  `ts-morph`, or a sidecar.
- Enabling `typeCheck` automatically through the package preset.
- Promoting resource-name heuristics to type proofs.
- Claiming that custom semantic Effect rules are implemented before the API
  gate is met.
