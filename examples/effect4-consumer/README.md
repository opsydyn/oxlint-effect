# Effect 4 Packed Consumer QA

This isolated consumer targets Effect 4.0.0. From the repository root,
run `bun run test:effect-versions`. The harness installs frozen dependencies and
the locally packed plugin in a temporary copy; the plugin is intentionally not
resolved from the root checkout or the public registry.

Failures are intentional. The complete matrix covers 141 applicable current
rules and all 18 groups, with annotated failures, clean repairs, declaration
checks and pinned runtime contracts. Five policies are legacy-only. The
[qualification index](src/qualification/README.md) groups the cases and records
their syntax limits; `qualification-cases.json` owns exact per-file counts.

For the full gate, run from the repository root:

```bash
bun run test:effect-versions -- --require-complete
```

Mixed-major files verify config isolation and version-specific warning counts.
This is lint/type/runtime-contract QA, not browser or application acceptance.
For a small consumer of the published package rather than the local tarball,
use the [npm Effect 4 example](../npm-effect4-consumer/README.md).
