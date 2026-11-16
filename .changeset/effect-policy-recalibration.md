---
"@opsydyn/oxlint-effect": minor
---

Allow traced Effect.fn generators and explicit Effect/Layer service contracts in
both recommended presets and their typeAware companions. The three former bans
remain available through explicit rules, effectComposition and allRules; their
diagnostics now identify the opt-in style policy.

Correct collection concurrency checks to reject visible `"unbounded"` and Infinity
budgets instead of the sequential default. Apply the same correction to retry
amplification checks, honour effective property order and retain opaque-value
limits. Add annotated failures, clean controls and packed type/runtime contracts
for both supported Effect majors. No runtime dependency or rule ID changes.
