import { Effect } from "effect";

declare const accountId: string;
declare const amount: number;
declare const currency: string;
declare const nowMs: number;
declare const order: {
  readonly id: string;
  readonly status: string;
  readonly cancelled: boolean;
  readonly shipped: boolean;
  readonly total: number;
  readonly customerTier: string;
  readonly createdAt: Date;
};

// EXPECT: linteffect/no-raw-domain-id-alias
// QA: Domain identifiers should not be raw primitive aliases.
export type UserId = string;

// EXPECT: linteffect/no-boolean-domain-flag
// QA: Boolean behavior flags hide domain modes that should be explicit variants.
export function settleInvoice(invoiceId: string, shouldNotifyCustomer: boolean) {
  return { invoiceId, shouldNotifyCustomer };
}

// EXPECT: linteffect/no-magic-domain-string
// QA: Magic domain strings should become literal unions or tagged variants.
export const approvedOrder = order.status === "approved";

// EXPECT: linteffect/no-raw-domain-primitive-params
// QA: Primitive-heavy domain APIs make account IDs, amounts, and currency values interchangeable.
export function transferFunds(fromAccountId: string, toAccountId: string, transferAmount: number) {
  return { fromAccountId, toAccountId, transferAmount };
}

// EXPECT: linteffect/no-raw-time-domain-field
// QA: Time units should be modeled explicitly instead of relying on raw number and Date fields.
export interface SessionLease {
  readonly sessionId: string;
  readonly expiresAt: number;
  readonly renewedAt: Date;
}

// EXPECT: linteffect/no-overloaded-options-object
// QA: Overloaded any options objects should become structured schemas.
export function createPaymentIntent(opts: any) {
  return opts;
}

// EXPECT: linteffect/no-domain-logic-in-conditional
// QA: Business rules embedded in conditionals should be named predicates or validation effects.
export const canApplyPremiumDiscount =
  order.total > 100 && order.customerTier === "premium" && currency !== "test";

// EXPECT: linteffect/no-implicit-state-machine-object
// QA: Multiple boolean state flags allow impossible domain states such as shipped and cancelled.
export const impossibleOrderState = order.cancelled && order.shipped;

// EXPECT: linteffect/no-adhoc-domain-error
// QA: Domain failures should use structured tagged errors, not ad hoc string failures.
export const rejectedTransfer = Effect.fail("not allowed");

// EXPECT: linteffect/no-domain-meaning-by-folder-only
// QA: Access context should be encoded in types or services, not inferred from admin/public folders.
export function deleteUserFromAdminPanel(id: string) {
  return { deletedUserId: id };
}

void [
  accountId,
  amount,
  nowMs,
  approvedOrder,
  canApplyPremiumDiscount,
  impossibleOrderState,
  rejectedTransfer,
];
