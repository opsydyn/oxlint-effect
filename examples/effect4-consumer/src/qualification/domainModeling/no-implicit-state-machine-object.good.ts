import { Effect } from "effect";
export { transition, LifecycleSchema } from "./domain-lifecycle";
interface Flags { approved: boolean; rejected: boolean; pending: boolean }
export const repeated = (state: Flags) => state.approved && state.approved;
export const computed = (state: Flags) => state["approved"] && state["rejected"];
export const different = (left: Flags, right: Flags) => left.approved && right.rejected;
export const aliases = (state: Flags) => { const approved = state.approved; const rejected = state.rejected; return approved && rejected; };
export const task = Effect.succeed(42);
