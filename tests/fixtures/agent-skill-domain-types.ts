import {
  decodeTransferCommand,
  createPaymentIntent,
  transferFunds,
  type SessionLease,
} from "../../skills/oxlint-effect/assets/domain-shapes.good";

const command = decodeTransferCommand({
  fromAccountId: "account-1",
  toAccountId: "account-2",
  transferAmount: 12.5,
});

transferFunds(command);

// @ts-expect-error Raw IDs and amounts do not satisfy branded domain fields.
transferFunds({ fromAccountId: "account-1", toAccountId: "account-2", transferAmount: 12.5 });

// @ts-expect-error Named command fields still require a branded amount.
transferFunds({ ...command, transferAmount: 12.5 });

// @ts-expect-error Named command fields still require a branded account ID.
transferFunds({ ...command, fromAccountId: "account-1" });

// @ts-expect-error An account ID cannot stand in for an epoch-millisecond timestamp.
const lease: SessionLease = { expiresAt: command.fromAccountId };

// @ts-expect-error Domain options require an amount, not an arbitrary object.
createPaymentIntent({ invoiceId: "invoice-1" });

void lease;
