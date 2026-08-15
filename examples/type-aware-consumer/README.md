# Type-Aware Consumer Fixture

This isolated TypeScript 7 consumer proves that the opt-in `typeAware` preset
can combine the package's syntax-only Effect rules with Oxc's built-in
type-aware TypeScript rules. The failure files are intentionally invalid.

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
`linteffect/no-effect-as`, `typescript/no-floating-promises`, and
`typescript/no-misused-promises` diagnostics. `typecheck` and `lint:valid`
must exit zero.

Task 3 replaces the local dependency with the generated package tarball, then
installs the temporary consumer. For example, use the packed artifact path in
the temporary consumer's manifest:

```json
{
  "dependencies": {
    "@opsydyn/oxlint-effect": "file:../../opsydyn-oxlint-effect-0.10.0.tgz"
  }
}
```

The tarball path is owned by the Task 3 harness; do not commit that temporary
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
  rules: typeAware.rules,
});
```

Add a named group or a rule-only export by extending `typeAware.rules`:

```ts
import { effectFlow, typeAware } from "@opsydyn/oxlint-effect";

const rules = {
  ...typeAware.rules,
  ...effectFlow.rules,
  "linteffect/no-effect-as": "error",
};
```

The package preset enables Oxc's root `options.typeAware` switch. It does not
enable `typeCheck`; type-aware linting and compiler-style type checking remain
separate opt-ins. A user who needs Oxlint type checking can enable it in their
own configuration:

```ts
export default defineConfig({
  options: { ...typeAware.options, typeCheck: true },
  jsPlugins: [...typeAware.jsPlugins],
  rules: typeAware.rules,
});
```

Without the package preset, enable the Oxc engine on the CLI with
`oxlint --type-aware src`. Select built-in rules explicitly in configuration:

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
the resolved Oxlint configuration. Do not place it inside an override or
nested configuration object.
