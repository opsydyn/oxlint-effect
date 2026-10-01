import { Effect } from "effect";
// CLEAN: named values in a linear generator, preserving the result shape.
export const direct = Effect.gen(function* () { const value = yield* Effect.succeed(1); return { value }; });
export const piped = Effect.succeed(1).pipe(Effect.map((value) => ({ value })));
const Other = { bind: (value: number) => ({ value }) };
export const unrelated = Other.bind(1);
