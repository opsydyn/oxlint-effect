import { transition, Rejected } from "./domain-lifecycle";
// @ts-expect-error contradictory flags are not a lifecycle union.
transition({ approved: true, rejected: true });
// @ts-expect-error approved state requires its receipt.
transition({ _tag: "Approved", userId: "u" });
// @ts-expect-error structured failure requires context and original cause.
new Rejected({ userId: "u" });
