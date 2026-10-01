# Effect 4 Packed Consumer QA

This isolated consumer targets Effect 4.0.0. From the repository root,
run `bun run test:effect-versions`. The harness installs frozen dependencies and
the locally packed plugin in a temporary copy; the plugin is intentionally not
resolved from the root checkout or the public registry.

Failures are intentional. The baseline expects exactly two
`no-effect-fail-error-message` diagnostics, while the clean control has none.
Mixed-major files exercise configuration isolation and boundary paths using
shared runner syntax, not complete v4 recovery/fork semantics. Config contracts
are checked against the packed declarations. This is foundation QA only.
