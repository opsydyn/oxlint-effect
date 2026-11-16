---
"@opsydyn/oxlint-effect": minor
---

Add no-error-cause-loss for inline error mappings that do not visibly pass the
original into a returned constructor. The rule uses real import/parameter
bindings, respects overwritten object properties and treats opaque inputs as
unknown. Support current and legacy map/recovery APIs with annotated failures,
clean controls, type checks and packed runtime contracts.

Enable this retention policy in errorModeling, ddd and allRules only; recommended
and its typeAware companion remain unchanged. Deliberate capture-and-erase
boundaries should not opt into a retention contract they do not own.

Document the measured runtime budget revision from 30 KB to 31 KB for this new
detector, without adding dependencies or hiding secondary output. The existing
agent corpus now demonstrates three actual opt-in diagnostics instead of a
review-only gap.
