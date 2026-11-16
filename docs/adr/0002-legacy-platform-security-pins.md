# ADR 0002: Patch The Legacy Consumer's Platform Dependencies

## Status

Accepted, 2026-11-16, for the approved legacy example security fix.

## Context

The private Effect 3 consumer pins @effect/platform 0.96.2, affected by
[GHSA-chp3-j5qr-2vfr](https://github.com/advisories/GHSA-chp3-j5qr-2vfr).
Cookie names, domains and paths can inject Set-Cookie attributes. The fixed
platform 0.97.1 requires Effect ^3.22.1; the existing atom, experimental and RPC
pins require the older platform minor.

## Decision

Pin platform 0.97.1, Effect 3.22.1, atom 0.7.0, experimental 0.61.1 and RPC
0.76.2 in the isolated legacy consumer, with its generated lockfile. These pins
satisfy the published peer requirements without ignoring or overriding them.
Keep root dependencies, Effect 4 consumers and published plugin APIs unchanged.

Add rejection tests for both constructors and all three injectable fields, plus
a legitimate-cookie serialization control. Run them in the existing
packed legacy consumer harness alongside its full type, diagnostic and runtime
contracts. Update current-version docs; retain historical qualification records.

## Options And Consequences

- Updating only platform leaves incompatible peers and risks npm replacing the
  frozen dependency graph during packed-plugin installation.
- Overrides or suppressing the advisory retain unqualified dependency contracts.
- Upgrading every consumer or taking latest releases exceeds this security fix.

The legacy qualification baseline moves from Effect 3.21.4 to 3.22.1. This is a
private QA dependency update, not a change to the plugin's supported major or a
package release. The example must retain its expected warnings and clean controls.

Inspection and execution of the published platform 0.97.1 tarball show that its
serializer trusts constructed cookies; forged objects still inject attributes.
Platform 0.97.2 has the same serializer, so taking that patch does not change this
limit. The upstream advisory describes serialization validation more broadly than
these artifacts implement. This fix qualifies the constructors, not forged or
mutated cookie objects. Never bypass construction with untrusted cookie fields.

## Acceptance And Recovery

The regression must fail on platform 0.96.2 and pass on 0.97.1. Require a frozen
install, the complete packed legacy suite, root tests and typecheck, package lint,
API docs and size checks. Do not push or publish as part of this local commit.
If compatibility checks fail, resolve them before committing; do not restore the
vulnerable platform as an accepted solution.
