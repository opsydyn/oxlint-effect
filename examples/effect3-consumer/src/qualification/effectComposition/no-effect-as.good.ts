import { Effect } from "effect";
// CLEAN: explicit value transformation.
export const direct = Effect.map(Effect.succeed(1), () => "ready");
export const piped = Effect.succeed(1).pipe(Effect.map(() => "ready"));
const Other = { as: (value: string) => value };
export const unrelated = Other.as("ready");
