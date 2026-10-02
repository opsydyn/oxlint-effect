import { Effect } from "effect";
const identity = (n: number) => n;
const tools = { value: () => 42 };
// linteffect/warn-effect-sync-wrapper: immediate arrow-call shape only.
export function deferred(events: string[]) {
  const touch = () => { events.push("touch"); return 42; };
  return Effect.sync(() => touch());
}
// Pure callee is still warned: no called-body purity proof.
export const pure = Effect.sync(() => identity(42));
export const member = Effect.sync(() => tools.value());
export const nested = Effect.sync(() => identity(identity(42)));
export function defect(error: object) { const throwError = () => { throw error; }; return Effect.sync(() => throwError()); }
