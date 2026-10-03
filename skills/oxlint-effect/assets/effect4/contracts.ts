// Effect 4 first-class packaged repair runtime contract.
import { Effect, Logger } from "effect";
import { decodeUserId, decodeInvoiceId, settleInvoice, rejectTransfer, TransferRejected } from "./domain.good";
import { decodeTransferCommand, encodeTransferCommand, transferFunds, decodeSessionLease, encodeSessionLease, decodePaymentIntent, encodePaymentIntent, createPaymentIntent } from "./domain-shapes.good";
import { decodeOrderStatus, isApproved, canApplyDiscount, decodeLegacyOrderState, encodeLegacyOrderState, Open, Shipped, shipOrder } from "./domain-decisions.good";
import { DeletionPolicy, DeletionDenied, deleteUserFromAdminPanel, decodeEpochMillis, isLeaseExpired } from "./domain-context.good";
import { ProfileUnavailable, loadProfile, refreshSession, readInventory } from "./public-errors.good";
import { rejectProfile, rethrowProfile, observeProfile } from "./error-preservation.good";
import { lookupSelection, recoverProfile, rejectCheckout, CheckoutRejectedError } from "./expected-state.good";
const check = (valid: boolean, message: string) => { if (!valid) throw new Error(message); };
const user = decodeUserId("user-1"); const invoice = decodeInvoiceId("invoice-1");
check(settleInvoice(invoice, "Notify").shouldNotifyCustomer && !settleInvoice(invoice, "Silent").shouldNotifyCustomer, "Notification payload changed");
const denied = Effect.runSync(Effect.flip(rejectTransfer(user)));
check(denied instanceof TransferRejected && denied.userId === user && denied.reason === "not allowed", "Domain rejection payload changed");
for (const input of [123, ""]) { let failed = false; try { decodeUserId(input); } catch { failed = true; } check(failed, "Invalid identifier accepted"); }
for (const amount of [0, -12.5, 12.5]) { const input = { fromAccountId: "", toAccountId: "account-2", transferAmount: amount }; check(JSON.stringify(encodeTransferCommand(transferFunds(decodeTransferCommand(input)))) === JSON.stringify(input), "Transfer wire changed"); }
for (const expiresAt of [0, -1, 1700000000123.5]) check(encodeSessionLease(decodeSessionLease({ expiresAt })).expiresAt === expiresAt, "Clock unit changed");
for (const input of [{ invoiceId: "invoice-1", amount: 12.5 }, { invoiceId: "invoice-1", amount: 12.5, memo: undefined }, { invoiceId: "invoice-1", amount: 12.5, memo: "" }]) {
  const output = encodePaymentIntent(createPaymentIntent(decodePaymentIntent(input)));
  check(JSON.stringify(output) === JSON.stringify(input) && Object.hasOwn(output, "memo") === Object.hasOwn(input, "memo"), "Optional field shape changed");
}
check(isApproved(decodeOrderStatus("approved")) && !isApproved(decodeOrderStatus("pending")), "Status vocabulary changed");
check(canApplyDiscount({ total: 101, itemCount: 2, discountPercentage: 20 }) && !canApplyDiscount({ total: 100, itemCount: 2, discountPercentage: 20 }), "Business threshold changed");
for (const flags of [{ cancelled: false, shipped: false }, { cancelled: true, shipped: false }, { cancelled: false, shipped: true }]) check(JSON.stringify(encodeLegacyOrderState(decodeLegacyOrderState(flags))) === JSON.stringify(flags), "Lifecycle wire changed");
check(shipOrder(Open.make({}))._tag === Shipped.make({})._tag, "Lifecycle transition changed");
const authorization = new DeletionDenied({ userId: user, reason: "denied" });
const operation = Effect.provideService(deleteUserFromAdminPanel(user), DeletionPolicy, { authorizeDelete: () => Effect.fail(authorization) });
check(Effect.runSync(Effect.flip(operation)) === authorization, "Policy failure identity changed");
check(isLeaseExpired(decodeSessionLease({ expiresAt: 41 }), decodeEpochMillis(42)), "Explicit clock comparison changed");
const cause = new Error("original"); const failure = new ProfileUnavailable({ cause });
check(Effect.runSync(Effect.flip(loadProfile(Effect.fail(cause)))).cause === cause, "Public cause identity changed");
check(Effect.runSync(Effect.flip(refreshSession(Effect.fail(cause)))).cause === cause, "Unknown cause identity changed");
check(Effect.runSync(Effect.flip(readInventory(Effect.fail(42))))._tag === "InventoryUnavailable", "Mixed failure discriminator changed");
const logger = Logger.make<unknown, void>(() => undefined);
const quiet = Logger.layer([logger]);
for (const task of [rejectProfile(failure), rethrowProfile(Effect.fail(failure)), observeProfile(Effect.fail(failure)), recoverProfile(Effect.fail(failure))]) check(Effect.runSync(Effect.provide(Effect.flip(task), quiet)) === failure, "Preserved error identity changed");
check(Effect.runSync(lookupSelection(undefined))._tag === "None" && Effect.runSync(lookupSelection("selected"))._tag === "Some", "Absence representation changed");
const rejected = Effect.runSync(Effect.flip(rejectCheckout("expected rejection")));
check(rejected instanceof CheckoutRejectedError && rejected.reason === "expected rejection", "Expected rejection lost typed payload");
