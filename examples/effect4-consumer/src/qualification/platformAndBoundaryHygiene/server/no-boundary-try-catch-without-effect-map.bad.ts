import { Context, Effect } from "effect";
export const original = { _tag: "ReadFailure", message: "original" };
export function raw() {
  // @lint-expect linteffect/no-boundary-try-catch-without-effect-map
  try { throw original; } catch (error) { return String(error); }
}
export async function promise() {
  // @lint-expect linteffect/no-boundary-try-catch-without-effect-map
  try { return await Promise.reject(original); } catch (error) { return String(error); }
}
export function noImportGate() {
  // @lint-expect linteffect/no-boundary-try-catch-without-effect-map: unrelated failures also warn at boundaries.
  try { return JSON.parse("42"); } catch { return 0; }
}
export function factoryOnly() {
  // @lint-expect linteffect/no-boundary-try-catch-without-effect-map: creating a runner is not mapped execution.
  try { return Effect.runPromiseWith(Context.empty()); } catch { return undefined; }
}
