# @opsydyn/oxlint-effect

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
