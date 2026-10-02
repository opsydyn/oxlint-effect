import { Effect } from "effect";
import { acquire, release, type Use } from "./nesting-support";
// @lint-expect linteffect/no-nested-acquire-release: three descendant acquisitions.
export const nested = <E>(use: Use<E>) => Effect.acquireUseRelease(acquire(), first =>
  Effect.acquireUseRelease(acquire(), second =>
    Effect.acquireUseRelease(acquire(), third => use([first, second, third]), pool => release("third", pool)),
    pool => release("second", pool)),
  pool => release("first", pool));
// @lint-expect linteffect/no-nested-acquire-release: the existing threshold also counts siblings, not just depth.
export const siblings = () => Effect.acquireUseRelease(acquire(), () => Effect.all([
  Effect.acquireUseRelease(acquire(), () => Effect.succeed(1), pool => release("left", pool)),
  Effect.acquireUseRelease(acquire(), () => Effect.succeed(2), pool => release("right", pool))
]), pool => release("outer", pool));
// @lint-expect linteffect/no-nested-acquire-release
export const legacy = () => Effect.scoped(Effect.acquireReleaseInterruptible(
  Effect.acquireReleaseInterruptible(
    Effect.acquireReleaseInterruptible(Effect.succeed(42), () => Effect.void),
    () => Effect.void),
  () => Effect.void));
