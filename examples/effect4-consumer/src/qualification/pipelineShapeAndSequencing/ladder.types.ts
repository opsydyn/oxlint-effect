import { Effect } from "effect";
const value: Effect.Effect<number> = Effect.flatMapEager(Effect.succeed(1), n => Effect.succeed(n + 41));
// @ts-expect-error The output is a number, not a string.
const wrong: Effect.Effect<string> = value;
void wrong;
