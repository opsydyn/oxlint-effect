import { Effect, Layer } from "effect";

declare const UserService: unknown;

export const missingProvision = Effect.runPromise(
  Effect.gen(function* () {
    yield* UserService;
    return "ok";
  }),
);

export const providedProgram = Effect.runPromise(
  Effect.gen(function* () {
    yield* UserService;
    return "ok";
  }).pipe(Effect.provide(Layer.empty)),
);
