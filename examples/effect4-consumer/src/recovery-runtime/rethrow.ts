import { Effect } from "effect";

const source = Effect.fail(new Error("source"));
// EXPECT: linteffect/no-catchall-generic-rethrow (data-first expression)
export const expression = Effect.catch(source, () => Effect.fail(new Error("lost")));
export const block = source.pipe(Effect.catch(() => {
  // EXPECT: linteffect/no-catchall-generic-rethrow (piped block return)
  return Effect.fail(new Error("lost"));
}));
