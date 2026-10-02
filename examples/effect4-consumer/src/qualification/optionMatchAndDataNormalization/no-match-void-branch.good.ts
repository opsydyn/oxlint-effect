import { Effect, Match } from "effect";
export const selected = (value: boolean) => Match.value(value).pipe(Match.when(true, () => undefined), Match.orElse(() => 42));
// Documented exact-shape gaps, not a no-op repair.
export const block = (value: boolean) => Match.value(value).pipe(Match.when(true, () => { return Effect.void; }), Match.orElse(() => { return Effect.void; }));
export const string = (value: string) => Match.value(value).pipe(Match.when("skip", () => Effect.void), Match.orElse(() => Effect.succeed(42)));
