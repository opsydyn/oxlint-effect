import { Effect, Scope } from "effect";
export const scoped = <A, E>(task: Effect.Effect<A, E>) => Effect.forkScoped(task);
export const inScope = <A, E>(task: Effect.Effect<A, E>, scope: Scope.Scope) => Effect.forkIn(task, scope);
export const child = <A, E>(task: Effect.Effect<A, E>) => Effect.forkChild(task);
// Factory construction is lazy and does not start a detached child.
export const factory = Effect.forkDetach({ startImmediately: true });
export const defaults = Effect.forkDetach();
export const undefinedOptions = Effect.forkDetach(undefined);
export const pipedScoped = <A, E>(task: Effect.Effect<A, E>) => task.pipe(Effect.forkScoped);
