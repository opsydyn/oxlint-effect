import { Effect } from "effect";
import {
  loadProfile,
  ProfileUnavailable,
  refreshSession,
  SessionRefreshFailed,
  readInventory,
  InventoryRejected,
  InventoryUnavailable,
} from "../../skills/oxlint-effect/assets/public-errors.good";

const profile: Effect.Effect<string, ProfileUnavailable> = loadProfile(Effect.succeed("profile-1"));
const session: Effect.Effect<string, SessionRefreshFailed> = refreshSession(Effect.succeed("session-1"));
const inventory: Effect.Effect<number, InventoryRejected | InventoryUnavailable> = readInventory(Effect.succeed(1));
// @ts-expect-error The public error contract no longer accepts a raw Error.
const rawProfile: Effect.Effect<string, ProfileUnavailable> = Effect.fail(new Error("offline"));
// @ts-expect-error Unknown causes must be wrapped, not exposed directly.
const rawSession: Effect.Effect<string, SessionRefreshFailed> = Effect.fail("offline");
// @ts-expect-error Mixed adapter failures must be mapped to the tagged union.
const rawInventory: Effect.Effect<number, InventoryRejected | InventoryUnavailable> = Effect.fail(503);
// @ts-expect-error Recovery must name a member of the public error union.
Effect.catchTag(inventory, "ProfileUnavailable", () => Effect.succeed(0));
// @ts-expect-error A cause field is required even when the value itself is undefined.
new SessionRefreshFailed({});
void profile;
void session;
void rawProfile;
void rawSession;
void rawInventory;
