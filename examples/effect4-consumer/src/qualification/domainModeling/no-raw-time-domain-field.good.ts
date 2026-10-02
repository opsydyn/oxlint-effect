import { DateTime, Duration, Effect } from "effect";
export { decodeOptions, encodeOptions } from "./domain-command";
export interface DomainTime { readonly createdAt: DateTime.Utc; readonly timeoutMs: Duration.Duration }
// Clean syntax can still conceal a raw representation.
type Milliseconds = number;
export type Hidden = { createdAt: Milliseconds; expiresAt: number | undefined; age: number };
export const task = Effect.succeed(42);
