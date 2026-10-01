import { Effect } from "effect";
// EXPECT: linteffect/no-effect-never (direct reference)
export const direct = Effect.never;
// EXPECT: linteffect/no-effect-never (scoped reference still prohibited by style policy)
export const scoped = Effect.scoped(Effect.never);
