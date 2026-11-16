# Selective Anti-Slop: Cause-Narrowing Guidance

- result: complete
- claim: the first cause-preservation agent-guidance slice is implemented locally; three candidate decisions are recorded, not claimed as new lint coverage.
- evidence: 615 tests / 5779 expectations, both complete packed majors, packed type-aware, types, publint, API docs, package contents, release inventory and unchanged size gate.
- remaining uncertainty: no new cause-loss detector, fresh-session agent-adherence evidence or hosted CI; the standalone Python skill validator could not start because PyYAML is unavailable.
- next: needs follow-up; review opt-in cause-loss lint policy and runtime size budget, then the separately scoped service/test candidates. Publishing requires separate authorisation.

## Scope And Decision

Reviewed K-Mistele/anti-slop at b7c1619b4d51b4815e89ba3700a975a6ec54b8c3.
The existing rules cover message-only failures and generic rethrows, not all
tagged mappings that discard causes. A tap's presence is not proof of actual
capture, and logging is not equivalent to retaining the original error.

Add focused skill routing and current/legacy bad/repair, runtime and negative-type
assets. Keep the anti-patterns REVIEW-ONLY: their zero current lint diagnostics
document an explicit gap. The reference app exposes that same gap. Do not invent
EXPECT rule IDs or claim a source detector exists. Existing EXPECT corpora and
all 146 registered rules / 18 groups remain unchanged.

The fixtures demonstrate one owned internal-retention/public-projection contract,
not a requirement that every translated error carries a cause. Preserve intended
recovery, expected domain outcomes, disclosure policy and caller migrations.
Ambient re-provision may intentionally pin a dependency for later execution;
binding equality alone cannot justify deleting it. General test adequacy remains
review work unless a narrow deterministic condition can be established.

No runtime architecture, export, dependency or default-policy contract changes,
so no new ADR was needed; the candidate decisions live in roadmap group 15.
No upstream source was ported wholesale, no global skill was changed, and no
paid inference, source upload, service activation or dependency upgrade ran.

## Verification

- Bad and repaired mappings share a tag and operation, but an identity check
  rejects the erasing control. Repairs retain the exact original and nested
  arbitrary causes without fabrication, including falsy values and NaN.
- A returned-but-unsequenced reporting Effect records nothing. Sequenced capture
  receives the original once, never runs on success, and exposes observer defects
  rather than pretending they preserve the original outcome automatically.
- Success values and environment requirements are preserved. Negative types reject
  erasing R, substituting a string error channel and exposing a raw public cause.
- Runtime checks preserve defects and interruption, and assert an explicit public
  projection excludes the fixture's private cause data. This is not telemetry,
  transport or production disclosure qualification.
- `bun run test`: 615 pass, 0 fail, 5779 expectations across 15 files.
- `bun scripts/verify-effect-version-consumers.ts --require-complete`: pinned
  Effect 3.22.1 and 4.0.0 pass types, diagnostic counts and runtime checks with the
  actual packed skill. Both bad and good review files remain full-DDD clean.
- Packed type-aware checks, root typecheck, build, publint, TypeDoc, release guard,
  package dry-run and `git diff --check` pass. Package includes all eight new
  corpus files and their guide. Tests use a writable temporary npm cache.
- Runtime bundle is unchanged: 128,955 raw bytes, 29,946 Brotli bytes / 30,000.
- The standalone skill validator was attempted but failed on missing PyYAML.
  Existing repository tests validate frontmatter, links, rule/export references
  and actual packed contents. No new validation dependency was installed.

Author self-review only; no independent or live-agent adherence pass is claimed.
A patch changeset covers packaged guidance and assets, not new lint behaviour.
No push or publication was performed in this slice.
