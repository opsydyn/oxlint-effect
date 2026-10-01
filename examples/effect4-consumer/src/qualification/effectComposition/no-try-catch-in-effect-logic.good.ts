import { Data, Effect } from "effect";
class ValidationError extends Data.TaggedError("ValidationError")<{ readonly field: string; readonly cause: unknown }> {}
export const original = new Error("invalid");
// CLEAN: throwing platform APIs are adapted into the typed error channel.
export const adapted = Effect.try({ try: () => { throw original; }, catch: (cause) => new ValidationError({ field: "userId", cause }) });
export const retained = Effect.catch(adapted, (error) => Effect.fail(error));
export function ordinary() { try { return JSON.parse("valid"); } catch (cause) { throw cause; } }
// CLEAN: an unused nested function does not execute in this callback.
export const unused = Effect.catch(adapted, (error) => { const unused = () => { try { throw "unused"; } catch (cause) { throw cause; } }; void unused; return Effect.fail(error); });
