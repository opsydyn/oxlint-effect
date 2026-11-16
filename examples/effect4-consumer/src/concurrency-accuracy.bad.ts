import { Effect as Fx, pipe as chain } from "effect";
import * as Package from "effect";
import { forEach as each, sync } from "effect/Effect";

declare const openFile: () => number;
let count = 0;

// EXPECT: linteffect/no-shared-mutable-state-across-fibers
// EXPECT: linteffect/no-global-mutable-concurrency-state
export const aliasWrites = Fx.forEach([1, 2], () => Fx.sync(() => ++count), { concurrency: 2 });
// EXPECT: linteffect/no-shared-mutable-state-across-fibers
// EXPECT: linteffect/no-global-mutable-concurrency-state
export const namespaceWrites = Package.Effect.all([1, 2].map(() => Fx.sync(() => ++count)), { concurrency: 2 });
// EXPECT: linteffect/no-shared-mutable-state-across-fibers
// EXPECT: linteffect/no-global-mutable-concurrency-state
export const dataLastWrites = chain([1, 2], each(() => sync(() => ++count), { concurrency: 2 }));

// EXPECT: linteffect/no-race-without-cleanup
export const aliasRace = Fx.race(Fx.succeed(42), Fx.sync(() => openFile()));
// EXPECT: linteffect/no-race-without-cleanup
// Cleanup on the other branch cannot own this acquisition.
export const siblingCleanup = Package.Effect.race(
  Fx.succeed(42).pipe(Fx.ensuring(Fx.void)), Fx.sync(() => openFile()),
);
