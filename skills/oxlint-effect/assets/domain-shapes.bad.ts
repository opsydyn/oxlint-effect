import { Schema } from "effect";

// EXPECT: linteffect/no-raw-domain-primitive-params
// QA: Positional strings and numbers do not express account and amount contracts.
export function transferFunds(fromAccountId: string, toAccountId: string, transferAmount: number) {
  return { fromAccountId, toAccountId, transferAmount };
}

// EXPECT: linteffect/no-raw-time-domain-field
// QA: This contract uses epoch milliseconds, but a raw number does not encode the unit.
export interface SessionLease {
  readonly expiresAt: number;
}

// EXPECT: linteffect/no-overloaded-options-object
// QA: Intended fields are invoiceId, amount, and optional memo; any cannot enforce them.
export function createPaymentIntent(opts: any) {
  return opts;
}

void Schema;
