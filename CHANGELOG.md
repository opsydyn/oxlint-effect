# @opsydyn/oxlint-effect

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
