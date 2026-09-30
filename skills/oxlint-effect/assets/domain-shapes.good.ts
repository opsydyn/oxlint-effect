import { Schema } from "effect";

export const AccountId = Schema.String.pipe(Schema.brand("AccountId"));
export const TransferAmount = Schema.Number.pipe(Schema.brand("TransferAmount"));

export const TransferCommand = Schema.Struct({
  fromAccountId: AccountId,
  toAccountId: AccountId,
  transferAmount: TransferAmount,
});
export type TransferCommand = typeof TransferCommand.Type;
export const decodeTransferCommand = Schema.decodeUnknownSync(TransferCommand);
export const encodeTransferCommand = Schema.encodeSync(TransferCommand);

export function transferFunds(command: TransferCommand) {
  return command;
}

export const EpochMillis = Schema.Number.pipe(Schema.brand("EpochMillis"));
export const SessionLease = Schema.Struct({ expiresAt: EpochMillis });
export type SessionLease = typeof SessionLease.Type;
export const decodeSessionLease = Schema.decodeUnknownSync(SessionLease);
export const encodeSessionLease = Schema.encodeSync(SessionLease);

export const PaymentIntent = Schema.Struct({
  invoiceId: Schema.String,
  amount: Schema.Number,
  memo: Schema.optional(Schema.String),
});
export type PaymentIntent = typeof PaymentIntent.Type;
export const decodePaymentIntent = Schema.decodeUnknownSync(PaymentIntent, {
  onExcessProperty: "error",
});
export const encodePaymentIntent = Schema.encodeSync(PaymentIntent);

export function createPaymentIntent(options: PaymentIntent) {
  return options;
}
