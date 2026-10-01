import { Data, Effect } from "effect";
class ValidationError extends Data.TaggedError("ValidationError")<{ readonly field: string; readonly cause: unknown }> {}
const source = new Error("invalid");
export const generator = Effect.gen(function* () { return yield* Effect.fail(new ValidationError({ field: "userId", cause: source })); });
export const mapping = Effect.map(Effect.succeed("value"), (value) => value.toUpperCase());
export const recovery = Effect.catch(generator, (error) => Effect.fail(error));
export const sourceError = source;
// CLEAN: throws in a plain non-Effect function are not domain Effect failures.
export function plain() { throw new Error("plain"); }
// CLEAN: defining an unused nested function does not throw from this handler.
export const nested = Effect.catch(generator, (error) => {
  const unused = () => { throw new Error("unused"); };
  void unused;
  return Effect.fail(error);
});
