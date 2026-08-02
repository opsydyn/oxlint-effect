# @opsydyn/oxlint-effect

## 0.10.0

### Minor Changes

- 4f898d9: Add Error Modeling Slice 3 with rules for boundary-owned recovery, expected domain states, and typed exception handling inside Effect workflows.

## 0.9.0

### Minor Changes

- ae96b9b: Add Error Modeling Slice 1 with public Effect error-channel rules for generic `Error`, `unknown`, and mixed primitive error shapes. Expose the `errorModeling` preset and include it in `ddd`.
- ed0ef2f: Add Error Modeling Slice 2 with rules that preserve structured failures through `Effect.fail`, `catchAll`, and error logging handlers.

## 0.8.0

### Minor Changes

- fd6dea9: Add concurrency-safety diagnostics for unbounded local Deferred coordination
  and resource acquisition inside concurrent Effect work without scoped release
  ownership.
- 444f694: Add Resource Lifetime diagnostics for manual resource cleanup, unbound scopes,
  and live resources escaping through `Effect.succeed`, plus a focused
  `resourceLifetime` preset.

## 0.7.0

### Minor Changes

- f744e21: Add strict concurrency-safety diagnostics for suspension inside semaphore permits, effectful SynchronizedRef modifiers, and unscoped daemon fibers. The rules use conservative direct-call syntax detection and keep custom abstractions outside their analysis scope.

## 0.6.0

### Minor Changes

- Add platform and boundary hygiene, testing and observability rule groups, and
  strict Effect test-shape diagnostics. The package now also checks that every
  exported rule has README documentation, an annotated QA example, and explicit
  roadmap or legacy ownership.

## 0.5.0

### Minor Changes

- f37a6b0: Complete the Service and Layer Architecture roadmap.

  Adds rules for modern Effect service shape, dependency declaration, service import/export hygiene, request-handler layer boundaries, Effect-returning service methods, layer pipeline style, infrastructure merge grouping, inline program provisioning, and scattered layer composition.

## 0.4.0

### Minor Changes

- 25553e7: Add grouped rule presets for consumer configuration.

  This release exports config-shaped presets and rule-only maps for every
  documented rule group, including the `ddd` alias for the domain-modeling rules,
  so consumers can opt into focused groups without manually copying rule names.

## 0.3.0

### Minor Changes

- beba76f: Add the remaining concurrency-safety rules.

  This release adds diagnostics for blocking sync calls inside Effect logic,
  Promise concurrency APIs inside Effect logic, shared mutable state across
  forked or parallel work, and timeout boundaries around noninterruptible Promise
  interop.

## 0.2.0

### Minor Changes

- 36b89f2: Add correctness-core lint rules for Effect execution semantics, error escapes, Promise and imperative escape hatches, and public generic error contracts.

## 0.1.1

### Patch Changes

- Add a complete domain-modeling lint rule family.

  This release adds rules for branded domain IDs, primitive-heavy domain APIs,
  boolean behavior flags, magic domain strings, raw time fields, overloaded
  options objects, embedded domain conditionals, implicit boolean state machines,
  ad hoc domain errors, and context meaning encoded only in helper names.

  The README now groups every rule by concern and gives a lightweight explanation
  for each diagnostic.

## 0.1.0

### Minor Changes

- 8efe871: Initial public release of the linteffect Oxlint plugin with upstream Effect rule parity.

### Patch Changes

- bcb28dc: Add publish quality tooling with tsdown, publint, Typedoc checks, and size-limit.
