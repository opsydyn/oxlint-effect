import { Effect, Match, Option } from "effect";
import * as Fx from "effect/Effect";
// Repair selects a value then uses one common pipeline.
export const match = (value: boolean) => Effect.map(Effect.succeed(Match.value(value).pipe(Match.when(true, () => 42), Match.orElse(() => 0))), n => n);
export const option = (value: Option.Option<number>) => Effect.map(Effect.succeed(Option.match(value, { onNone: () => 0, onSome: n => n + 41 })), n => n);
// A naive common transform changes absent/false paths: clean syntax is not equivalence.
export const unsafeCommon = (value: boolean) => Effect.map(Effect.succeed(Match.value(value).pipe(Match.when(true, () => 1), Match.orElse(() => 0))), n => n + 41);
// Leaf Effects are permitted; aliases/named callbacks and gen-only sequencing stay opaque.
export const leaf = (value: boolean) => Match.value(value).pipe(Match.when(true, () => Effect.succeed(42)), Match.orElse(() => Effect.succeed(0)));
export const aliased = (value: boolean) => Match.value(value).pipe(Match.when(true, () => Fx.map(Fx.succeed(1), n => n + 41)), Match.orElse(() => Fx.succeed(0)));
const named = () => Effect.map(Effect.succeed(1), n => n + 41);
export const stored = (value: boolean) => Match.value(value).pipe(Match.when(true, named), Match.orElse(() => Effect.succeed(0)));
export const generator = (value: boolean) => Match.value(value).pipe(Match.when(true, () => Effect.gen(function* () { const first = yield* Effect.succeed(1); return yield* Effect.succeed(first + 41); })), Match.orElse(() => Effect.succeed(0)));
