# Consumer Configuration

## Effect Major

Published 2.x default groups target Effect 4; published 1.x remains legacy and
does not export `effect3`. Upgrade the plugin to 2.x to select legacy presets
without upgrading Effect. Every preset and rules-only companion is available under
`effect3` for Effect 3. See [all versioned groups](versioned-rules.md) for the
matching failure/repair corpus. Verify the installed package before selecting it.

```ts
import { defineConfig } from "oxlint";
import { effect3 } from "@opsydyn/oxlint-effect";

export default defineConfig({
  jsPlugins: [...effect3.ddd.jsPlugins],
  rules: effect3.dddRules,
});
```

Sensitive manual entries default to Effect 4. Preserve the selected major when
overriding severity, `boundaryPaths` or `configPaths`; apply overrides after maps.
An explicit override does not make removed APIs applicable to current Effect.

## Install Or Upgrade

Use the consumer's package manager and lockfile. Inspect the installed Oxlint
and plugin versions and their supported configuration APIs. Update the existing
dependency instead of introducing a second plugin copy. Do not upgrade Effect or
TypeScript as a side effect of ordinary lint configuration.

For a new Bun consumer:

```bash
bun add -d oxlint @opsydyn/oxlint-effect
```

The package supplies its own runtime dependencies. A consumer does not need to
vendor plugin source or copy this repository's development dependencies.

## Select Policy

`recommended` selects the package's broad default policy. `ddd` combines Domain
Modeling and Error Modeling; `domainModeling` selects just Domain Modeling.
They are alternative starting policies, not escalating installation steps.
Keep a consumer's selected policy and explicit rule overrides unless changing
them is requested. Inspect other group exports in the installed package docs.

Focused DDD configuration:

```ts
import { defineConfig } from "oxlint";
import { ddd } from "@opsydyn/oxlint-effect";

export default defineConfig({
  plugins: ["typescript"],
  jsPlugins: [...ddd.jsPlugins],
  rules: ddd.rules,
});
```

This is a new-config example. When adapting an existing config, merge its
plugin array rather than replacing it, deduplicate the `linteffect` entry, and
preserve unrelated entries. The spread converts the readonly tuple to the
mutable array expected by Oxlint.

Compose rule maps when multiple groups were requested:

```ts
import { defineConfig } from "oxlint";
import { domainModeling, domainModelingRules, errorModelingRules } from "@opsydyn/oxlint-effect";

export default defineConfig({
  plugins: ["typescript"],
  jsPlugins: [...domainModeling.jsPlugins],
  rules: { ...domainModelingRules, ...errorModelingRules },
});
```

Apply retained explicit rule settings after preset maps so that the migration
does not silently override the consumer's policy. Preserve file overrides too.

## Type-Aware Opt-In

Only enable type-aware linting when requested and supported by the installed
Oxlint. Consult that version's requirements for `oxlint-tsgolint`, TypeScript,
project resolution, and editor integration. The consumer owns the engine
dependency and must build workspace dependencies whose declarations are needed.

```ts
import { defineConfig } from "oxlint";
import { typeAware } from "@opsydyn/oxlint-effect";

export default defineConfig({
  options: typeAware.options,
  jsPlugins: [...typeAware.jsPlugins],
  plugins: ["typescript"],
  rules: {
    ...typeAware.rules,
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
  },
});
```

Verify both built-in rule names exist in the installed Oxlint. Merge root
options with existing options. `typeAware` keeps recommended syntax rules and
enables the engine; typed TypeScript rules are consumer selections. `typeCheck`
is a separate compiler-diagnostics opt-in. Custom `linteffect` rules do not gain
resolved type information merely by enabling the engine.

## Validation

Run the existing lint/typecheck scripts from the relevant workspace. Record
baseline diagnostics before modifying policy, then distinguish newly introduced
findings from existing ones. Assessment or configuration work does not imply a
full application migration. Do not create ignore patterns for owned application
code merely to make the setup pass.
