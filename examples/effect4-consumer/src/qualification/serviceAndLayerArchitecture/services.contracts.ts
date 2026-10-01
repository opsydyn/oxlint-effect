import { Effect } from "effect";
import { Built, BuiltLive, Key, KeyLive, ClassKey, ClassKeyLive } from "./prefer-effect-service.good";
import * as bad from "./no-layer-provide-in-service-definition.bad";
import * as good from "./no-layer-provide-in-service-definition.good";
for (const value of [
  await Effect.runPromise(Effect.gen(function* () { return (yield* Built).value; }).pipe(Effect.provide(BuiltLive))),
  await Effect.runPromise(Effect.gen(function* () { return (yield* Key).value; }).pipe(Effect.provide(KeyLive))),
  await Effect.runPromise(Effect.gen(function* () { return (yield* ClassKey).value; }).pipe(Effect.provide(ClassKeyLive))),
  (await Effect.runPromise(bad.Direct.make)).value,
  (await Effect.runPromise(bad.Functional.make())).value,
  (await Effect.runPromise(bad.Expression.make)).value,
  (await Effect.runPromise(good.Direct.make)).value,
  (await Effect.runPromise(good.Functional.make())).value,
  (await Effect.runPromise(good.Expression.make)).value,
  await Effect.runPromise(Effect.gen(function* () { return (yield* good.Direct).value; }).pipe(Effect.provide(good.live)))
]) if (value !== 42) throw new Error("Service repair changed the value");
