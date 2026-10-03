import { Data, Effect } from "effect";
class ValidationError extends Data.TaggedError("ValidationError")<{ readonly field: string; readonly cause: unknown }> {}
export const original = new Error("invalid");
export const tagged = new ValidationError({ field: "userId", cause: original });
// CLEAN: an Effect-returning callback flattens the typed failure instead of mapping it as data.
export const mappedFailure = Effect.flatMap(Effect.sync(() => "ready"), () => Effect.fail(tagged));
export const eagerFailure = Effect.flatMapEager(Effect.sync(() => "ready"), () => Effect.fail(tagged));
export const eagerPure = Effect.mapEager(Effect.sync(() => "ready"), value => value.toUpperCase());
// CLEAN: delegate the failure inside a generator; returning an Effect would succeed with that Effect as data.
export const generatorFailure = Effect.gen(function* () { yield* Effect.fail(tagged); });
// CLEAN: throwing platform APIs are adapted into the typed error channel.
export const adapted = Effect.try({ try: () => { throw original; }, catch: (cause) => new ValidationError({ field: "userId", cause }) });
export const retained = Effect.catch(adapted, (error) => Effect.fail(error));
export function ordinary() { try { return JSON.parse("valid"); } catch (cause) { throw cause; } }
// CLEAN: an unused nested function does not execute in this callback.
export const unused = Effect.catch(adapted, (error) => { const unused = () => { try { throw "unused"; } catch (cause) { throw cause; } }; void unused; return Effect.fail(error); });
