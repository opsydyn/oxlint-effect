import { Data, Effect, Match } from "effect";

export class ProfileUnavailable extends Data.TaggedError("ProfileUnavailable")<{
  readonly cause: Error;
}> {}

export class SessionRefreshFailed extends Data.TaggedError("SessionRefreshFailed")<{
  readonly cause: unknown;
}> {}

export class InventoryRejected extends Data.TaggedError("InventoryRejected")<{
  readonly detail: string;
}> {}

export class InventoryUnavailable extends Data.TaggedError("InventoryUnavailable")<{
  readonly code: number;
}> {}

export function loadProfile(operation: Effect.Effect<string, Error>): Effect.Effect<string, ProfileUnavailable> {
  return Effect.mapError(operation, (cause) => new ProfileUnavailable({ cause }));
}

export function refreshSession(operation: Effect.Effect<string, unknown>): Effect.Effect<string, SessionRefreshFailed> {
  return Effect.mapError(operation, (cause) => new SessionRefreshFailed({ cause }));
}

export function readInventory(operation: Effect.Effect<number, string | number>): Effect.Effect<number, InventoryRejected | InventoryUnavailable> {
  return Effect.mapError(operation, (failure) => Match.value(failure).pipe(
    Match.when(Match.string, (detail) => new InventoryRejected({ detail })),
    Match.orElse((code) => new InventoryUnavailable({ code })),
  ));
}
