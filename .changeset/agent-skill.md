---
"@opsydyn/oxlint-effect": minor
---

Ship an installable `oxlint-effect` companion agent skill for configuring the
installed plugin, diagnosing DDD warnings, and performing requested repairs.

- Include configuration guidance and paired failure/repair examples covering all
  21 existing DDD rules: domain identity, commands, states, predicates, time,
  policy context, structured errors, recovery ownership and expected outcomes.
- Verify exact diagnostics, full-DDD clean controls, negative TypeScript
  contracts, wire roundtrips, error identity, executed logging and failure channels.
- Document caller migration, intentional QA failures, syntax-detector limitations,
  `catchAll` versus `tapError`, and the opt-in type-aware configuration boundary.
- Include the skill, references and examples in the npm package; document separate
  skill installation through `npx skills add opsydyn/oxlint-effect --skill oxlint-effect`.

Existing lint rules and preset behaviour are unchanged. Fixture checks validate
the companion examples, not the correctness of every agent-generated repair.
