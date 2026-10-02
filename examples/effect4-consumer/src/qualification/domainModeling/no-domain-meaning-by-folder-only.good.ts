import { Effect } from "effect";
import type { UserId } from "./domain-vocabulary";
export { readUser, AdminReader, adminLayer } from "./domain-context";
export function getAdminUser(userId: UserId) { return Effect.succeed(userId); }
// Existing declaration/name gaps, not context-bearing repairs.
export const getPublicUser = (userId: string) => userId;
export function getAdminUserByKey(key: string) { return key; }
export function getadminUser(userId: string) { return userId; }
