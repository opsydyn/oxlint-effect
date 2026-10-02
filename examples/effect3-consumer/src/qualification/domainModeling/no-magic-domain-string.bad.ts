import { Effect } from "effect";
// linteffect/no-magic-domain-string: all four equality operators and either side.
export const strict = (status: string) => status === "approved";
export const loose = (status: string) => status == "approved";
export const different = (status: string) => status !== "approved";
export const looseDifferent = (status: string) => status != "approved";
export const reversed = (status: string) => "approved" === status;
// Existing policy is broad: non-domain and legitimate discriminant checks also warn.
export const label = (text: string) => text === "hello";
export const tag = (value: { _tag: string }) => value._tag === "Ready";
// Only the exact typeof-boolean check is excluded by current policy.
export const shape = (value: unknown) => typeof value === "string";
export const task = Effect.succeed(42);
