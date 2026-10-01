# Effect 4 First-Class Compatibility

Status: approved by the user on 2026-10-01; implementation not started.

## Intent

Make Effect 4 the first-class target of `@opsydyn/oxlint-effect`. Preserve an
explicit Effect 3 compatibility path without allowing legacy service advice,
removed APIs or unqualified examples into the default experience.

The user selected v4 defaults and an `effect3` namespace for legacy use. This is
a breaking preset and guidance change, planned for plugin `2.0.0`. It is not a
claim that compatibility is already implemented.

## Evidence

The current development dependency and consumer fixtures use Effect 3.21.4.
An isolated assessment against stable Effect 4.0.0 established:

- The plugin loads without an Effect runtime dependency.
- Five selected v3 syntax diagnostics became one after valid v4 API renames.
- The companion good controls fail v4 typechecking across Context, Schema,
  Predicate, Option and recovery APIs.
- Service rules recognise `Effect.Service` and recommend accessors/dependencies
  options which are not the v4 service model.
- Runtime execution detection omits the new context-aware `run*With` APIs.

Primary references:

- [Effect 4 release](https://effect.website/blog/releases/effect/40)
- [Service migration](https://github.com/Effect-TS/effect/blob/main/migration/services.md)
- [Error migration](https://github.com/Effect-TS/effect/blob/main/migration/error-handling.md)
- [Fork migration](https://github.com/Effect-TS/effect/blob/main/migration/forking.md)
- [Schema migration](https://github.com/Effect-TS/effect/blob/main/migration/schema.md)

## Public Configuration

Existing unqualified exports become Effect 4 policy: `recommended`, `ddd`,
`concurrencySafety`, every other group preset, their rules-only companions,
`ruleGroups`, `presets`, `allRules` and the opt-in `typeAware` preset.

Add the named `effect3` export with the corresponding v3 configurations:

```ts
import { recommended, ddd, effect3 } from "@opsydyn/oxlint-effect";

// Effect 4: recommended.rules or ddd.rules
// Effect 3: effect3.recommended.rules or effect3.ddd.rules
```

`effect3` includes every existing group preset and rules-only companion,
`recommendedRules`, `allRules`, `ruleGroups`, `presets`, `typeAware` and the shared
`jsPlugins` registration. Plugin name, package specifier and stable rule IDs
remain `linteffect` and `@opsydyn/oxlint-effect`.

There is one plugin registration, not two implementations or plugin names.
`typeAware` remains opt-in for both majors and does not enable compiler
diagnostics or convert syntax rules into custom typed rules.

Do not detect an Effect version by reading node_modules, a lockfile or a package
manifest during rule execution. Different workspaces and overrides can target
different majors in one Oxlint process. Explicit policy must be reproducible.

## Rule Options And Compatibility

Version-sensitive rules accept a validated `effectVersion: 3 | 4` option,
defaulting to 4 when manually enabled without options. Version-neutral rules
retain their existing options and behaviour.

The `effect3` rules maps supply `effectVersion: 3` for every sensitive rule;
unqualified maps select v4. Compose this field with existing options such as
`boundaryPaths`; do not replace or drop them. Public configuration types must
support severity-plus-options tuples as well as severity-only entries.

Explicit per-rule configuration can override a preset. Documentation must show
how to retain the major selection when adding custom paths or changing severity.
Conflicting policies for the same rule resolve through ordinary Oxlint rules
merging, not hidden plugin state. Invalid version values fail configuration
validation rather than silently choosing a major.

Keep the legacy default diagnostics and preset membership under `effect3`.
Do not rename rules merely because the relevant combinator changed its name.
Messages and recommended repairs follow the selected major. Legacy-looking
syntax under a v4 policy is not automatically a proven migration error; add
migration diagnostics only where independently specified and tested.

`allRules` means all applicable rules for its selected major. Rules intrinsically
about removed v3 APIs remain registered for legacy use but are excluded from
v4 presets and v4 `allRules`. Update inventory tests to separate registered
rules from version-applicable preset membership.

## Detection Work

### Recovery And Runtime

Audit all recovery recognition sets and callbacks, not just the three initial
missing examples. v4 uses `catch`, `catchCause`, `catchDefect` and filter-based
recovery. Include eager and reason-based variants only where the rule's semantic
contract applies; do not treat every operator containing catch as equivalent.

Recognise every supported v4 runner, including context-aware `run*With` forms,
with data-first and curried call coverage where relevant. Preserve boundary path
defaults and overrides. Re-audit nested callback and observation rules.

### Concurrency And Resources

Cover `forkChild`, `forkDetach`, unchanged scoped variants and startup options.
Revisit lifecycle and supervision assumptions: a name replacement alone is not
proof of equivalent ownership, interruption or cleanup behaviour.

Audit Fiber observations, queues/pubsub, permits, mutable state, Deferred,
acquisition/release, scopes and runtime/resource interaction against v4 APIs.
Do not reactivate previously deferred rules without a valid supported trigger.

### Services And Layers

Recognise `Context.Service` class and function forms, `make`, explicit layers,
service retrieval and `.layer` conventions. Follow resolved syntax available to
the plugin, without claiming inferred environment proofs.

The v3 `accessors: true` and `dependencies` requirements do not apply to v4.
Keep their rules legacy-only; do not prescribe those options in v4. Rework
service, layer and test-layer detectors around explicit construction and
provisioning. Preserve Layer.provide where it is legitimate composition rather
than transferring v3 restrictions mechanically.

### Domain And Other Groups

Audit Schema recognition, construction/decoding advice, Option, Result/Either,
Match, Predicate, runtime/platform imports and React atom integrations. Keep
domain contracts and wire formats explicit during fixture migration. Where an
ecosystem module remains unstable, record its qualified version and scope.

Every exported group must be classified as unchanged, adapted, legacy-only or
not yet qualified. No group is assumed v4-ready solely because it loads.

## Examples And Companion Skill

Make root guidance and primary examples v4-first. Retain clearly labelled v3
fixtures and skill examples for legacy users rather than replacing the only
passing legacy controls. The skill selects guidance from the consumer's actual
major, selected configuration and installed APIs.

Both corpora include annotated failures and clean controls, valid configuration
examples, compile-time negative examples and runtime contract checks where
applicable. Keep domain/error semantics distinct from mechanical API migration.
Preserve all 21 DDD rule contracts, version-scoped applicability and cause/time/
optional-field behaviour; do not claim every detector variant is covered.

## Qualification

Use isolated, packed-package consumers for both majors with exact dependency
versions and lockfiles. Typecheck fixtures, compare diagnostic IDs and counts,
and require clean controls to exit zero. A missing expected warning fails the
gate, even if the plugin loaded successfully.

CI must run both major targets. Validate default and legacy group configurations,
mixed-major overrides, option merging, manual rule configuration and packaged
skill contents. A central coverage inventory must prevent a registered rule or
group from silently escaping the version audit.

Continue the normal tests, typecheck, build, publint, API docs, size and packaging
gates. Preserve the separate packed type-aware checks. Version-aware consumers
must consume the release tarball, not only local `src/index.ts`.

## Delivery And Release

Implement in reviewed, logically grouped slices, normally three rules per slice,
with tests, examples, documentation and a commit for each verified slice.
Foundation work can span presets and test infrastructure without pretending it
implements three new diagnostics. Detailed rule allocation belongs in the
implementation plan and version audit inventory.

Do not publish an intermediate v4 default while major groups remain unaudited.
The `2.0.0` release gate requires all applicable v4 groups qualified, the legacy
matrix green, migration documentation complete and no unexplained diagnostic
losses. Publication credentials and registry verification are separate release
prerequisites, not evidence supplied by successful code tests.

## Non-Goals

- Automatic consumer-code migration or automatic changes to business policies.
- Removing Effect 3 support or enabling typed linting by default.
- Claiming type-aware custom rules or resource lifetime proofs from syntax.
- Expanding business-rule policy unrelated to version compatibility.
- Shipping an Effect runtime dependency inside the plugin.
