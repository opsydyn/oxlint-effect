# Legacy Effect 3 npm Consumer Example

This example verifies the published 1.x `@opsydyn/oxlint-effect` package from
npm instead of the local source plugin.

This remains a legacy regression fixture, not the 2.x quick start. For the
published 2.0.0 plugin with Effect 4, use the
[current npm example](../npm-effect4-consumer/README.md).

It also documents the user-land fix for Oxlint's mutable `jsPlugins` config type:

```ts
jsPlugins: [...recommended.jsPlugins],
```

`recommended.jsPlugins` is exported as a readonly tuple, while Oxlint currently expects a mutable `ExternalPluginEntry[]`. Spreading creates a mutable array without weakening the package types.

Run from this folder:

```bash
bun install
bun run typecheck
bun run lint
```

The lint command is expected to report `linteffect/*` diagnostics in `src/domain.ts`. The test override disables `linteffect/no-run-effect-outside-boundary` under `test/**/*.ts`.
