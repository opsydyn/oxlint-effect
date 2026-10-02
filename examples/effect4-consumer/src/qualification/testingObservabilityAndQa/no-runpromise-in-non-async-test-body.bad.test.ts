import { it, test, it as specify, it as bench } from "bun:test";
import { Context, Effect } from "effect";
// @lint-expect linteffect/no-runpromise-in-non-async-test-body (five discarded runners).
it("discarded arrow", () => { Effect.runPromise(Effect.succeed(42)); });
test("discarded expression", function() { Effect.runPromise(Effect.succeed(42)); });
specify("discarded alias", () => { Effect.runPromise(Effect.succeed(42)); });
bench("literal callback name", () => { Effect.runPromise(Effect.succeed(42)); });
it("async does not own a discarded promise", async () => { Effect.runPromise(Effect.succeed(42)); await Promise.resolve(); });
// @lint-expect linteffect/no-runpromise-in-non-async-test-body
it("contextual execution", () => { Effect.runPromiseWith(Context.empty())(Effect.succeed(42)); });
