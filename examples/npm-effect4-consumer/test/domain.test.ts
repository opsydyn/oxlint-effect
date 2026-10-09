import { expect, test } from "bun:test";
import { Effect } from "effect";
import { decodeInvoiceId, decodeUserId, transferRejection, settleInvoice, TransferRejected } from "../src/domain.good.ts";

test("both notification modes preserve the intended output", () => {
  const invoiceId = decodeInvoiceId("invoice-1");
  expect(settleInvoice(invoiceId, "Notify")).toEqual({ invoiceId, shouldNotifyCustomer: true });
  expect(settleInvoice(invoiceId, "Silent")).toEqual({ invoiceId, shouldNotifyCustomer: false });
  expect(() => decodeUserId(123)).toThrow();
});

test("typed failure retains domain context", () => {
  const userId = decodeUserId("user-1");
  const failure = Effect.runSync(Effect.flip(Effect.fail(transferRejection(userId))));
  expect(failure).toBeInstanceOf(TransferRejected);
  expect(failure.userId).toBe(userId);
  expect(failure.reason).toBe("not allowed");
});
