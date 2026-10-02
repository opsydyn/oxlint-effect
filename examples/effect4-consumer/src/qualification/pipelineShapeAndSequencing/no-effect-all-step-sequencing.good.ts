import { Effect, Ref } from "effect";
export function sequential(ref: Ref.Ref<number>) {
  return Effect.gen(function*() {
    const first = yield* Ref.set(ref, 1);
    const second = yield* Ref.set(ref, 42);
    return [first, second];
  });
}
export function discarded(ref: Ref.Ref<number>) {
  return Effect.gen(function*() { yield* Ref.set(ref, 1); yield* Ref.set(ref, 42); });
}
// Actual value aggregation is not side-effect step sequencing.
export const values = Effect.all([Effect.succeed(20), Effect.succeed(22)], { concurrency: 1 });
// Documented syntax gaps, not semantic repairs: defaults, options/steps aliases.
export function defaults(ref: Ref.Ref<number>) { return Effect.all([Ref.set(ref, 42)]); }
export function options(ref: Ref.Ref<number>) { const policy = { concurrency: 1 }; return Effect.all([Ref.set(ref, 42)], policy); }
export function opaque(ref: Ref.Ref<number>) { const steps = [Ref.set(ref, 42)]; return Effect.all(steps, { concurrency: 1 }); }
// discard:true is valid in both majors, but not recognised as an asVoid pipe.
export function discardOption(ref: Ref.Ref<number>) { return Effect.all([Ref.set(ref, 42)], { discard: true }); }
