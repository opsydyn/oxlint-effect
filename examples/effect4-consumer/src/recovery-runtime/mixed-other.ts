import { Effect } from "effect";

const source = Effect.fail(new Error("source"));
// EXPECT: linteffect/no-catchall-generic-rethrow (data-first expression)
export const expression = Effect.catch(source, () => Effect.fail(new Error("lost")));
export const block = source.pipe(Effect.catch(() => {
  // EXPECT: linteffect/no-catchall-generic-rethrow (piped block return)
  return Effect.fail(new Error("lost"));
}));

const fallbackValue = "default";
// EXPECT: linteffect/no-early-catchall-null
export const nullRecovery = Effect.catch(source, () => Effect.succeed(null));
export const undefinedRecovery = source.pipe(Effect.catch(() => {
  // EXPECT: linteffect/no-early-catchall-null
  return Effect.succeed(undefined);
}));
// EXPECT: linteffect/no-early-catchall-null
export const namedRecovery = source.pipe(Effect.catch(() => Effect.succeed(fallbackValue)));
