// Effect 4 first-class asset; qualify against the pinned current consumer.
import { Data, Effect, Schema } from "effect";

export const UserId = Schema.NonEmptyString.pipe(Schema.brand("UserId"));
export type UserId = typeof UserId.Type;
export const decodeUserId = Schema.decodeUnknownSync(UserId);

export const InvoiceId = Schema.NonEmptyString.pipe(Schema.brand("InvoiceId"));
export type InvoiceId = typeof InvoiceId.Type;
export const decodeInvoiceId = Schema.decodeUnknownSync(InvoiceId);

export const NotificationMode = Schema.Literals(["Notify", "Silent"]);
export type NotificationMode = typeof NotificationMode.Type;

const notificationSettings: Record<NotificationMode, boolean> = {
  Notify: true,
  Silent: false,
};

export function settleInvoice(invoiceId: InvoiceId, notification: NotificationMode) {
  return { invoiceId, shouldNotifyCustomer: notificationSettings[notification] };
}

export class TransferRejected extends Data.TaggedError("TransferRejected")<{
  readonly userId: UserId;
  readonly reason: string;
}> {}

export function rejectTransfer(userId: UserId) {
  const error = new TransferRejected({ userId, reason: "not allowed" });
  return Effect.fail(error);
}
