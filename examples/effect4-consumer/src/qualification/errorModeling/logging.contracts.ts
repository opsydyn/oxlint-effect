import { Effect, Exit, Option, Result } from "effect";
import { retained, original, observed, causeObserved, defectObserved, eager, causeRetained, defectRetained } from "./no-log-only-error-handling.good";
for (const program of [retained, observed, causeObserved, eager, causeRetained]) {
  const exit = await Effect.runPromiseExit(program);
  if (!Exit.isFailure(exit)) throw new Error("Logging swallowed failure");
  const error = Exit.findErrorOption(exit);
  if (!Option.isSome(error) || error.value !== original) throw new Error("Logging changed error identity");
}
for (const program of [defectObserved, defectRetained]) {
  const exit = await Effect.runPromiseExit(program);
  if (!Exit.isFailure(exit)) throw new Error("Defect became success");
  if (Option.isSome(Exit.findErrorOption(exit))) throw new Error("Defect became typed failure");
  const defect = Exit.findDefect(exit);
  if (!Result.isSuccess(defect) || defect.success !== original) throw new Error("Defect identity changed");
}
console.log("Recovery and observer identity contracts passed");
