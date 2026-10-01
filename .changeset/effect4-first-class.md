---
"@opsydyn/oxlint-effect": major
---

Make Effect 4 the default policy for plugin presets and version-sensitive rules.
This is a breaking configuration change: Effect 3 projects must select the
`effect3` namespace or set `effectVersion: 3` on manually configured sensitive
rules. Existing rule IDs and the single `linteffect` plugin registration remain.

Add version-specific recovery, generator, callback and behaviour-decoration
recognition, with annotated failing examples, clean repairs and packed consumer
contracts for both Effect majors. Keep removed Effect 3 APIs in the legacy
presets rather than default Effect 4 presets. Type-aware presets remain opt-in.

This changeset stages the major release; it does not establish release readiness.
The exhaustive qualification and release gates must pass before publication.
