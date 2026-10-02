import { Effect } from "effect";
import { original } from "./failure";
// @lint-expect linteffect/no-effect-log-without-structured-context (five common recovery/observer log calls).
export const recover = Effect.catchAll(Effect.fail(original), () => Effect.as(Effect.logError("failed"), 42));
export const tagged = Effect.catchTag(Effect.fail(original), "Q28Failure", () => Effect.as(Effect.logWarning("failed"), 42));
export const tags = Effect.catchTags(Effect.fail(original), { Q28Failure: () => Effect.as(Effect.logError("failed"), 42) });
export const observe = Effect.tapError(Effect.fail(original), () => Effect.logWarning("failed"));
export const template = Effect.catchAll(Effect.fail(original), () => Effect.as(Effect.logError(`failed`), 42));
// @lint-expect linteffect/no-effect-log-without-structured-context (service method logs).
export class LogService extends Effect.Service<LogService>()("Q28Logs", { effect: Effect.succeed({ load: () => Effect.logWarning("service failed") }) }) {}
