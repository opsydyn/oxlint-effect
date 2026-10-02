import { Effect } from "effect";
// linteffect/no-raw-domain-id-alias: spelling does not prevent swapped primitives.
export type UserId = string;
export type InvoiceID = number;
export type Id = string;
export type ForeignId = number;
export const task = Effect.succeed(42);
