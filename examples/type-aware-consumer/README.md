# Type-Aware Consumer Fixture

This isolated TypeScript 7 consumer proves that the opt-in `typeAware` preset
can combine the package's syntax-only Effect rules with Oxc's built-in
type-aware TypeScript rules. The failure files are intentionally invalid.

The fixture owns `oxlint-tsgolint` and TypeScript 7. The published package
remains a syntax-only JavaScript plugin; it does not install the engine or add
custom semantic Effect rules.

## Local Development

The fixture develops against the root package through `file:../..`. Build the
root package before installing so the local dependency has current `dist`
exports:

```bash
bun run build
cd examples/type-aware-consumer
bun install
bun run typecheck
bun run lint
bun run lint:valid
```

`lint` is expected to exit non-zero and report the annotated
`linteffect/prefer-pipe-for-behavior`, `linteffect/no-effect-as`,
`linteffect/no-call-tower`, `typescript/no-floating-promises`, and
`typescript/no-misused-promises` diagnostics. `typecheck` and `lint:valid`
must exit zero.

Task 3 replaces the local dependency with the generated package tarball, then
installs the temporary consumer. For example, use the packed artifact path in
the temporary consumer's manifest:

```json
{
  "dependencies": {
    "@opsydyn/oxlint-effect": "file:../../opsydyn-oxlint-effect-<version>.tgz"
  }
}
```

Replace `<version>` with the package version in the generated tarball. The
tarball path is owned by the Task 3 harness; do not commit that temporary
dependency change to this fixture.

## Configuration Variants

Configure the preset by copying its individual fields. `jsPlugins` is a
readonly tuple, while Oxlint expects a mutable array.

```ts
import { defineConfig } from "oxlint";
import { typeAware } from "@opsydyn/oxlint-effect";

export default defineConfig({
  options: typeAware.options,
  jsPlugins: [...typeAware.jsPlugins],
  plugins: ["typescript", "unicorn", "oxc"],
  rules: typeAware.rules,
});
```

`typeAware` enables Oxc's root `options.typeAware` switch. It does not enable
`typeCheck` or choose any built-in `typescript/*` rules. Add type-aware Oxc
rules explicitly in the consumer configuration.

Compose additional Effect groups through their rule-only exports:

```ts
import { defineConfig } from "oxlint";
import {
  typeAware,
  domainModelingRules,
  errorModelingRules,
} from "@opsydyn/oxlint-effect";

export default defineConfig({
  options: typeAware.options,
  jsPlugins: [...typeAware.jsPlugins],
  plugins: ["typescript", "unicorn", "oxc"],
  rules: {
    ...typeAware.rules,
    ...domainModelingRules,
    ...errorModelingRules,
  },
});
```

Every existing named group preset has the same configuration shape. Use its
readonly plugin tuple through a spread when selecting one directly:

```ts
import { defineConfig } from "oxlint";
import { effectFlow } from "@opsydyn/oxlint-effect";

export default defineConfig({
  jsPlugins: [...effectFlow.jsPlugins],
  plugins: ["typescript"],
  rules: effectFlow.rules,
});
```

`typeAware` is the only new mode in this slice. Type-aware linting and
compiler-style type checking are separate consumer opt-ins. A consumer that
needs Oxlint compiler diagnostics can configure both options explicitly:

```ts
export default defineConfig({
  options: {
    typeAware: true,
    typeCheck: true,
  },
});
```

The package preset uses the first option only. The preceding configuration is
consumer-owned and is not part of the package preset.

Without the package preset, enable the Oxc engine from the CLI:

```bash
oxlint --type-aware
```

Select built-in rules explicitly in configuration:

```ts
export default defineConfig({
  options: { typeAware: true },
  rules: {
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
  },
});
```

For editor or LSP integrations, pass `options.typeAware: true` at the root of
the resolved Oxlint configuration. Do not place it inside an override or nested
configuration object. See Oxc's [type-aware linting guide](https://oxc.rs/docs/guide/usage/linter/type-aware.html)
for engine requirements and the [JavaScript plugin API](https://oxc.rs/docs/guide/usage/linter/js-plugins.html)
for the current custom typed-rule boundary.
