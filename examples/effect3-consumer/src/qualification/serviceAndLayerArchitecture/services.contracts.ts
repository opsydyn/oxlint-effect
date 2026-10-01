import { Effect } from "effect";
import { Tagged, Generic } from "./prefer-effect-service.bad";
import { Built } from "./prefer-effect-service.good";
import * as bad from "./no-layer-provide-in-service-definition.bad";
import * as good from "./no-layer-provide-in-service-definition.good";
import * as accessorBad from "./require-service-accessors.bad";
import * as accessorGood from "./require-service-accessors.good";
for (const value of [
  await Effect.runPromise(Effect.gen(function* () { return (yield* Tagged).value; }).pipe(Effect.provideService(Tagged, { value: 42 }))),
  await Effect.runPromise(Effect.gen(function* () { return (yield* Generic).value; }).pipe(Effect.provideService(Generic, { value: 42 }))),
  await Effect.runPromise(Built.value.pipe(Effect.provide(Built.Default))),
  await Effect.runPromise(Effect.gen(function* () { return (yield* bad.Direct).value; }).pipe(Effect.provide(bad.Direct.Default))),
  await Effect.runPromise(Effect.gen(function* () { return (yield* bad.Piped).value; }).pipe(Effect.provide(bad.Piped.Default))),
  await Effect.runPromise(Effect.gen(function* () { return (yield* good.Direct).value; }).pipe(Effect.provide(good.live))),
  await Effect.runPromise(Effect.gen(function* () { return (yield* good.Piped).value; }).pipe(Effect.provide(good.Piped.Default))),
  await Effect.runPromise(Effect.gen(function* () { return (yield* accessorBad.Missing).value; }).pipe(Effect.provide(accessorBad.Missing.Default))),
  await Effect.runPromise(Effect.gen(function* () { return (yield* accessorBad.Disabled).value; }).pipe(Effect.provide(accessorBad.Disabled.Default))),
  await Effect.runPromise(accessorGood.Missing.value.pipe(Effect.provide(accessorGood.Missing.Default))),
  await Effect.runPromise(accessorGood.Disabled.value.pipe(Effect.provide(accessorGood.Disabled.Default)))
]) if (value !== 42) throw new Error("Service repair changed the value");
