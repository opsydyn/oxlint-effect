import { Match, Schema } from "effect";
// Brands prevent accidental interchange; validation is a separate schema check.
export const UserIdSchema = Schema.String.check(Schema.isMinLength(1)).pipe(Schema.brand("Q30UserId"));
export const InvoiceIdSchema = Schema.String.check(Schema.isMinLength(1)).pipe(Schema.brand("Q30InvoiceId"));
export type UserId = typeof UserIdSchema.Type;
export type InvoiceId = typeof InvoiceIdSchema.Type;
export const acceptUser = (id: UserId) => id;
export type Command = { readonly _tag: "Notify"; readonly userId: UserId } | { readonly _tag: "Silent"; readonly userId: UserId };
export const execute = (command: Command) => Match.value(command).pipe(
  Match.tag("Notify", value => ({ userId: value.userId, notified: true })),
  Match.tag("Silent", value => ({ userId: value.userId, notified: false })),
  Match.exhaustive,
);
export const StatusSchema = Schema.Literals(["approved", "rejected"]);
export type Status = typeof StatusSchema.Type;
export const score = (status: Status) => Match.value(status).pipe(
  Match.when("approved", () => 42), Match.when("rejected", () => 0), Match.exhaustive,
);
