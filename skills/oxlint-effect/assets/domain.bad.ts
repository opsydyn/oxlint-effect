import { Effect } from "effect";

// EXPECT: linteffect/no-raw-domain-id-alias
// QA: Raw aliases do not distinguish user identifiers from other strings.
export type UserId = string;

// EXPECT: linteffect/no-boolean-domain-flag
// QA: The caller must remember what true and false mean.
export function settleInvoice(invoiceId: string, shouldNotifyCustomer: boolean) {
  return { invoiceId, shouldNotifyCustomer };
}

// EXPECT: linteffect/no-adhoc-domain-error
// QA: String failures lose structured operation context.
export const rejectedTransfer = Effect.fail("not allowed");
