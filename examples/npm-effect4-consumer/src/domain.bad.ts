import { Effect } from "effect";

// EXPECT: linteffect/no-raw-domain-id-alias
// QA: This alias cannot distinguish users from other strings.
export type UserId = string;

// EXPECT: linteffect/no-boolean-domain-flag
// QA: Callers must remember the meaning of the boolean argument.
export function settleInvoice(invoiceId: string, shouldNotifyCustomer: boolean) {
  return { invoiceId, shouldNotifyCustomer };
}

// EXPECT: linteffect/no-adhoc-domain-error
// QA: A string failure discards the user and reason as structured fields.
export const rejectedTransfer = Effect.fail("not allowed");
