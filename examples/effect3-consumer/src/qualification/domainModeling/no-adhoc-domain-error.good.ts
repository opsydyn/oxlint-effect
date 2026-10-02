import { Effect } from "effect";
export { Rejected, reject } from "./domain-lifecycle";
// Clean gaps: naming/alias/template syntax does not establish structured failure.
const text = "Denied";
export const stored = Effect.fail(text);
export const template = Effect.fail(`Denied`);
export function dynamic(text: string) { throw new Error(text); }
