import { Effect as Fx, Ref, pipe as chain } from "effect";
import * as Package from "effect";
import { forEach as each, sync } from "effect/Effect";

export const sequential = () => {
  let count = 0;
  return Fx.forEach([1, 2], () => Fx.sync(() => ++count));
};
export const singleWorker = () => {
  let count = 0;
  return chain([1, 2], each(() => sync(() => ++count), { concurrency: 1 }));
};
export const workerLocal = Package.Effect.forEach([1, 2], count => Fx.sync(() => ++count), { concurrency: 2 });
export const immutable = Fx.forEach([1, 2], value => Fx.succeed(value * 2), { concurrency: 2 });
export const atomic = Fx.gen(function* () {
  const count = yield* Ref.make(0);
  yield* Fx.forEach([1, 2], () => Ref.update(count, n => n + 1), { concurrency: 2 });
  return yield* Ref.get(count);
});
// No acquisition: race already owns loser interruption, so no dummy ensuring.
export const pureRace = Fx.race(Fx.succeed(42), Fx.never);
export const opaqueRace = <E>(left: Fx.Effect<number, E>, right: Fx.Effect<number, E>) => Fx.race(left, right);
export const ownedRace = (openFile: () => number, closeFile: () => void) => Fx.race(
  Fx.succeed(42), Fx.sync(() => openFile()).pipe(Fx.ensuring(Fx.sync(closeFile))),
);
// Names alone are not Effect API evidence.
export const shadow = (Fx: { forEach: (values: number[], work: (n: number) => number, options: { concurrency: number }) => number[] }) =>
  Fx.forEach([1, 2], value => value + 1, { concurrency: 2 });
