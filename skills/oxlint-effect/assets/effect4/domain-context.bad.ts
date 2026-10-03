// Effect 4 first-class asset; qualify against the pinned current consumer.
import { Data, Effect } from "effect";

// EXPECT: linteffect/no-domain-meaning-by-folder-only
// QA: An admin helper name does not establish caller authority.
export function deleteUserFromAdminPanel(id: string) {
  return Effect.succeed(id);
}

// EXPECT: linteffect/no-new-date-in-domain-logic
// QA: Reading wall-clock time inside domain logic prevents fixed-time tests.
export function readDomainTime() {
  return new Date().getTime();
}

// EXPECT: linteffect/no-empty-error-tag
// QA: The caller cannot identify the rejected target or reason.
export class DeletionDenied extends Data.TaggedError("DeletionDenied")<{}> {}
