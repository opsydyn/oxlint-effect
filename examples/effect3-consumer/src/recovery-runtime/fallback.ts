import { Effect } from "effect";

const source = Effect.fail(new Error("source"));
const fallbackValue = "default";
// EXPECT: linteffect/no-early-catchall-null
export const nullRecovery = Effect.catchAll(source, () => Effect.succeed(null));
export const undefinedRecovery = source.pipe(Effect.catchAll(() => {
  // EXPECT: linteffect/no-early-catchall-null
  return Effect.succeed(undefined);
}));
// EXPECT: linteffect/no-early-catchall-null
export const namedRecovery = source.pipe(Effect.catchAll(() => Effect.succeed(fallbackValue)));
