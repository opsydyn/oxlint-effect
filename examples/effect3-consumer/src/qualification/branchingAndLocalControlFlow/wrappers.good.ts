import { Effect } from "effect";
// Explicit values and named transformations instead of IIFE choreography.
export const transform = (n: number) => n + 41;
export const value = transform(1);
export const task = Effect.succeed(value);
export function attempt(fn: () => number) { return Effect.try({ try: fn, catch: error => error }).pipe(Effect.match({ onFailure: error => ({ _tag: "Failure" as const, error }), onSuccess: n => n })); }
export function cleanup(fn: () => number, events: string[]) { return Effect.try({ try: fn, catch: error => error }).pipe(Effect.ensuring(Effect.sync(() => { events.push("cleanup"); }))); }
export function deferred(fn: () => Promise<number>) { return Effect.tryPromise({ try: fn, catch: error => error }); }
// These member-call/FunctionExpression shapes are gaps, not recommended repairs.
export const callGap = (function(this: { value: number }) { return this.value; }).call({ value: 42 });
// Async and generator named functions retain their semantics without an IIFE.
export async function asynchronous() { return 42; }
export function* generator() { yield 42; }
