import { Effect, Ref } from "effect";
// linteffect/no-effect-all-step-sequencing: lexical sequential side effects.
export function sequential(ref: Ref.Ref<number>) { return Effect.all([Ref.set(ref, 1), Ref.set(ref, 42)], { concurrency: 1 }); }
export function quoted(ref: Ref.Ref<number>) { return Effect.all([Ref.set(ref, 42)], { "concurrency": 1 }); }
// asVoid itself triggers even without explicit sequential concurrency.
export function discarded(ref: Ref.Ref<number>) { return Effect.all([Ref.set(ref, 1), Ref.set(ref, 42)]).pipe(Effect.asVoid); }
// Two matching CallExpressions: collection and discard pipeline.
export function both(ref: Ref.Ref<number>) { return Effect.all([Ref.set(ref, 42)], { concurrency: 1 }).pipe(Effect.asVoid); }
export function unused(ref: Ref.Ref<number>) { return Effect.all([Effect.sync(() => { const never = () => Ref.set(ref, 0); return 42; })], { concurrency: 1 }); }
export const logged = Effect.all([Effect.logInfo("Q44 log")], { concurrency: 1 });
