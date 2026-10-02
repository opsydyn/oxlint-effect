import { Effect } from "effect";
import { DatabasePool, openConnection } from "./pool-support";
// @lint-expect linteffect/no-request-scoped-long-lived-resource
export function requestHandler() { return openConnection(); }
// @lint-expect linteffect/no-request-scoped-long-lived-resource
export const endpoint = function () { return new DatabasePool(); };
// @lint-expect linteffect/no-request-scoped-long-lived-resource
export const route = () => openConnection();
// @lint-expect linteffect/no-request-scoped-long-lived-resource
export const actions = { controller: () => new DatabasePool() };
export function workflowHandler() {
  return Effect.gen(function* () {
    // @lint-expect linteffect/no-request-scoped-long-lived-resource
    const first = yield* Effect.sync(() => openConnection());
    // @lint-expect linteffect/no-request-scoped-long-lived-resource
    const second = yield* Effect.sync(() => new DatabasePool());
    return [first, second];
  });
}
// @lint-expect linteffect/no-request-scoped-long-lived-resource
export const mappedHandler = () => Effect.map(Effect.succeed(42), () => new DatabasePool());
// @lint-expect linteffect/no-request-scoped-long-lived-resource
export const tracedHandler = () => Effect.fn("Q23.request")(function* () { return yield* Effect.sync(() => openConnection()); })();
