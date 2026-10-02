import { Effect, Scope, Supervisor } from "effect";
export const scoped = <A, E>(task: Effect.Effect<A, E>) => Effect.forkScoped(task);
export const inScope = <A, E>(task: Effect.Effect<A, E>, scope: Scope.Scope) => Effect.forkIn(task, scope);
export const child = <A, E>(task: Effect.Effect<A, E>) => Effect.fork(task);
// Retained legacy marker: supervision observes fibers; it does not itself close them.
export const supervised = <A, E>(task: Effect.Effect<A, E>) => Effect.forkDaemon(Effect.supervised(task, Supervisor.none));
