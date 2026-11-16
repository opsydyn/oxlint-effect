---
"@opsydyn/oxlint-effect": minor
---

Improve three concurrency rules for both supported Effect majors. Race cleanup
warnings now require visible acquisition without a local owner, rather than
requiring dummy finalizers on pure or opaque tasks. Cleanup on another race
branch no longer hides an unowned acquisition.

Shared/global mutation checks distinguish explicit parallel collections from
sequential defaults, use lexical ownership in both majors, and recognise const
containers. These three rules resolve real Effect value imports, aliases and
namespace/subpath forms while excluding shadowed and type-only bindings. Add
annotated failures, clean controls and packed runtime contracts; retain existing
rule IDs, presets and documented limits for opaque code.
