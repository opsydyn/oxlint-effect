import { Effect } from "effect";
const value = 42, data = { value: 42 };
// linteffect/no-effect-succeed-variable: identifier/member shape, no branch proof.
export const identifier = Effect.succeed(value);
export const member = Effect.succeed(data.value);
export const computed = Effect.succeed(data["value"]);
export function branch(enabled: boolean) { return enabled ? Effect.succeed(value) : Effect.succeed(0); }
// Undefined and a local same-name object remain shape-based reports.
const missing = undefined;
export const absent = Effect.succeed(missing);
export function ordinary() { const Effect = { succeed: (n: number) => n }; return Effect.succeed(value); }
