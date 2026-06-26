import { Effect } from "effect";

const program = Effect.gen(function* () {
  const value = yield* Effect.succeed("done");
  return value;
});

export const run = program.pipe(Effect.map((value) => value.toUpperCase()));
