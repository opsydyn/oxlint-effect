// Import-order gap, not a repair.
export function raw(userId: string, orderId: string, amount: number) { return [userId, orderId, amount]; }
export interface Times { createdAt: number }
export const options = (opts: any) => opts;
import { Effect } from "effect";
export const task = Effect.succeed(42);
