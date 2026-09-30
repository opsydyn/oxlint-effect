import { Context, Data, Effect, Schema } from "effect";
import { type UserId } from "./domain.good";
import { EpochMillis, type SessionLease } from "./domain-shapes.good";

export class DeletionDenied extends Data.TaggedError("DeletionDenied")<{
  readonly userId: UserId;
  readonly reason: string;
}> {}

export class DeletionPolicy extends Context.Tag("agent-skill/DeletionPolicy")<
  DeletionPolicy,
  {
    readonly authorizeDelete: (userId: UserId) => Effect.Effect<void, DeletionDenied>;
  }
>() {}

export function deleteUserFromAdminPanel(userId: UserId) {
  return Effect.gen(function* () {
    const policy = yield* DeletionPolicy;
    yield* policy.authorizeDelete(userId);
    return userId;
  });
}

const FiniteEpochMillis = EpochMillis.pipe(Schema.finite());
export const decodeEpochMillis = Schema.decodeUnknownSync(FiniteEpochMillis);
const validateEpochMillis = Schema.validateSync(FiniteEpochMillis);

export function isLeaseExpired(lease: SessionLease, now: typeof EpochMillis.Type) {
  return validateEpochMillis(now) >= validateEpochMillis(lease.expiresAt);
}
