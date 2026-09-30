import { type Effect } from "effect";
import { decodeUserId, type UserId } from "../../skills/oxlint-effect/assets/domain.good";
import { decodeSessionLease } from "../../skills/oxlint-effect/assets/domain-shapes.good";
import {
  DeletionDenied,
  deleteUserFromAdminPanel,
  isLeaseExpired,
} from "../../skills/oxlint-effect/assets/domain-context.good";

const userId = decodeUserId("user-1");
// @ts-expect-error The policy dependency cannot disappear before a runner boundary.
const unprovided: Effect.Effect<UserId, DeletionDenied, never> = deleteUserFromAdminPanel(userId);
// @ts-expect-error A raw identifier cannot bypass the existing user model.
deleteUserFromAdminPanel("user-1");
// @ts-expect-error The time input must carry the existing epoch-millisecond brand.
isLeaseExpired(decodeSessionLease({ expiresAt: 1 }), 1);
// @ts-expect-error Structured rejection context is required.
new DeletionDenied({ userId });
void unprovided;
