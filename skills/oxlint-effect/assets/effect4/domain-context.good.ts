// Effect 4 first-class asset; qualify against the pinned current consumer.
import { Context, Data, Effect, Schema } from "effect";
import { type UserId } from "./domain.good";
import { EpochMillis, type SessionLease } from "./domain-shapes.good";

export class DeletionDenied extends Data.TaggedError("DeletionDenied")<{
  readonly userId: UserId;
  readonly reason: string;
}> {}

export class DeletionPolicy extends Context.Service<
  DeletionPolicy,
  {
    readonly authorizeDelete: (userId: UserId) => Effect.Effect<void, DeletionDenied>;
  }
>()("agent-skill/DeletionPolicy") {}

export function deleteUserFromAdminPanel(userId: UserId) {
  return Effect.gen(function* () {
    const policy = yield* DeletionPolicy;
    yield* policy.authorizeDelete(userId);
    return userId;
  });
}

const FiniteEpochMillis = EpochMillis.check(Schema.isFinite());
export const decodeEpochMillis = Schema.decodeUnknownSync(FiniteEpochMillis);
const validateEpochMillis = Schema.decodeUnknownSync(FiniteEpochMillis);

export function isLeaseExpired(lease: SessionLease, now: typeof EpochMillis.Type) {
  return validateEpochMillis(now) >= validateEpochMillis(lease.expiresAt);
}
