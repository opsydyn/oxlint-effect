# Published Effect 4 Consumer

Small DDD QA example using **@opsydyn/oxlint-effect 2.0.0 from npm**, Effect 4.0.0
and the public `ddd` preset. It does not import the repository's plugin source
or a locally packed tarball. Dependencies are pinned and the lockfile is committed.
The TypeScript config includes `ESNext.Disposable` for Effect 4's resource types;
declaration checks remain enabled rather than hiding missing types with skipLibCheck.
The dedicated `Published Effect 4 consumer QA` CI job repeats the commands below.

From the repository root:

```bash
cd examples/npm-effect4-consumer
bun install --frozen-lockfile
bun run typecheck
bun run qa
bun run test
```

`qa` succeeds only when the three annotated failures produce exactly their
expected rule IDs and the paired repairs remain clean under both `ddd` and the
root quick-start's `recommended` config. `test` checks actual
Effect 4 outputs and structured failures; no frontend/backend server is started.

| Rule | Failure | Repair |
| --- | --- | --- |
| `no-raw-domain-id-alias` | An interchangeable string ID alias | Schema-backed branded identifier |
| `no-boolean-domain-flag` | An ambiguous boolean argument | Explicit notification mode |
| `no-adhoc-domain-error` | A string failure | A tagged error with user and reason |

Inspect [failures](src/domain.bad.ts) and [repairs](src/domain.good.ts).
To see the diagnostics directly, run `bun run lint`; its non-zero exit is
intentional. `bun run lint:valid` must exit zero. Do not fix the annotated failures.

The [config](oxlint.config.ts) spreads the readonly `jsPlugins` tuple and selects
only DDD rules. The [recommended config](oxlint.recommended.config.ts) reproduces
the [root quick start](../../README.md#quick-start) for broader policy. Both configs
are typechecked against the published package. Other groups and type-aware
linting remain independent choices. The [legacy npm consumer](../npm-consumer/README.md)
is retained separately for Effect 3/plugin 1.x; do not copy its Runtime.runFork
example into Effect 4.
