// Documented import-order gap, not a semantic repair.
export type UserId = string;
export const flag = (shouldNotify: boolean) => shouldNotify;
export const compare = (status: string) => status === "approved";
import { Effect } from "effect";
export const task = Effect.succeed(42);
