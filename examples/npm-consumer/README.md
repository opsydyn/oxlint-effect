# npm Consumer Example

This example verifies the published `@opsydyn/oxlint-effect@0.2.0` package from npm instead of the local source plugin.

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
