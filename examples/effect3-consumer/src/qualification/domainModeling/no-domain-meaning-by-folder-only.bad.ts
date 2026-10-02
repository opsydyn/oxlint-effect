import { Effect } from "effect";
// linteffect/no-domain-meaning-by-folder-only: context names plus direct raw IDs.
export function getAdminUser(userId: string) { return Effect.succeed(userId); }
export function getPublicUser(userId: string) { return userId; }
export function getInternalUser(userId: string) { return userId; }
export function getExternalUser(userId: string) { return userId; }
export function getPrivateUser(userId: number) { return userId; }
export function getBackofficeUser(id: string) { return id; }
export function getPanelUser(userID: string) { return userID; }
