import {
  decodeOrderStatus,
  decodeLegacyOrderState,
  isApproved,
  shipOrder,
  cancelOrder,
  Shipped,
  Cancelled,
  type OrderState,
} from "../../skills/oxlint-effect/assets/domain-decisions.good";

isApproved(decodeOrderStatus("approved"));
decodeLegacyOrderState({ cancelled: false, shipped: false });

// @ts-expect-error Unsupported statuses cannot enter the domain operation.
isApproved("lost");

// @ts-expect-error A shipped order cannot be cancelled in this example lifecycle.
cancelOrder(Shipped.make({}));

// @ts-expect-error A cancelled order cannot be shipped in this example lifecycle.
shipOrder(Cancelled.make({}));

// @ts-expect-error A fresh variant literal cannot declare an unrelated boolean flag.
const impossible: OrderState = { _tag: "Shipped", cancelled: true };

// Structural typing allows extra fields through an intermediate variable.
// Runtime validators, not this assignment, reject the contradictory payload.
const extraShipped: { readonly _tag: "Shipped"; readonly cancelled: boolean } = {
  _tag: "Shipped", cancelled: true,
};
const structurallyAccepted: OrderState = extraShipped;

void impossible;
void structurallyAccepted;
