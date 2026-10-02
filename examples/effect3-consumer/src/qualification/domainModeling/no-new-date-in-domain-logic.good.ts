import { Effect } from "effect";
export { domainTime } from "./domain-context";
// Aliases/global qualification/Date function are clean gaps, not injected clocks.
const NativeDate = Date;
export const alias = () => new NativeDate();
export const qualified = () => new globalThis.Date();
export const functionCall = () => Date();
export const task = Effect.succeed(42);
