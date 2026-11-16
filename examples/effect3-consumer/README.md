# Effect 3 Packed Consumer QA

This isolated consumer targets Effect 3.22.1 and @effect/platform 0.97.1. From the repository root,
run `bun run test:effect-versions`. The harness installs frozen dependencies and
the locally packed plugin in a temporary copy; the plugin is intentionally not
resolved from the root checkout or the public registry.

The platform pin fixes [GHSA-chp3-j5qr-2vfr](https://github.com/advisories/GHSA-chp3-j5qr-2vfr).
Atom, experimental and RPC are pinned to compatible peers. The packed suite also
runs `bun run test:security`, which rejects cookie-name, domain and path attribute
injection in both constructors, while preserving legitimate cookie serialization.
The serializer trusts constructed cookies; this does not qualify forged or mutated
cookie objects as safe.
Run that command here for the focused regression check.

Failures are intentional. The baseline expects exactly two
`no-effect-fail-error-message` diagnostics, while the clean control has none.
Mixed-major files use cross-policy boundary paths and per-file JSON diagnostic
counts in one process. They exercise configuration isolation with shared runner
syntax, not complete v4 recovery/fork semantics. Config contracts
are checked against the packed declarations. This is foundation QA only.
