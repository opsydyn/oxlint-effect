import { Effect } from "effect";
export { submit, decodeCommand } from "./domain-command";
// Threshold/annotation gaps are not validated repairs.
export const two = (userId: string, amount: number) => [userId, amount];
export const ordinary = (a: string, b: string, c: number) => [a, b, c];
type Raw = string;
export const aliases = (userId: Raw, orderId: Raw, customerId: Raw) => [userId, orderId, customerId];
export const object = (input: { userId: string; orderId: string; amount: number }) => Effect.succeed(input);
