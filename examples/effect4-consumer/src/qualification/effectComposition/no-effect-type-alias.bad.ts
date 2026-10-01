import { Effect } from "effect";
// EXPECT: linteffect/no-effect-type-alias (direct alias)
export type Task = Effect.Effect<string>;
// EXPECT: linteffect/no-effect-type-alias (nested alias)
export type Envelope = { readonly task: Effect.Effect<string> };
