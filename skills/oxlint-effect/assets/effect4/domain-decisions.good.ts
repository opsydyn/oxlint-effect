// Effect 4 first-class asset; qualify against the pinned current consumer.
import { Match, Predicate, Schema } from "effect";

const ApprovedStatus = Schema.Literal("approved");
export const OrderStatus = Schema.Union([
  Schema.Literals(["pending", "shipped", "cancelled"]),
  ApprovedStatus,
]);
export type OrderStatus = typeof OrderStatus.Type;
export const decodeOrderStatus = Schema.decodeUnknownSync(OrderStatus);
const matchesApprovedStatus = Schema.is(ApprovedStatus);

export function isApproved(status: OrderStatus) {
  return matchesApprovedStatus(status);
}

const exceedsMinimumTotal = (total: number) => total > 100;
const meetsItemMinimum = (itemCount: number) => itemCount >= 2;
const withinDiscountCap = (discountPercentage: number) => discountPercentage <= 20;

export const canApplyDiscount = Predicate.Struct({
  total: exceedsMinimumTotal,
  itemCount: meetsItemMinimum,
  discountPercentage: withinDiscountCap,
});

export const Open = Schema.TaggedStruct("Open", {});
export type Open = typeof Open.Type;
export const Shipped = Schema.TaggedStruct("Shipped", {});
export const Cancelled = Schema.TaggedStruct("Cancelled", {});
export const OrderState = Schema.Union([Open, Shipped, Cancelled]);
export type OrderState = typeof OrderState.Type;

const LegacyOrderState = Schema.Union([
  Schema.Struct({ cancelled: Schema.Literal(false), shipped: Schema.Literal(false) }),
  Schema.Struct({ cancelled: Schema.Literal(true), shipped: Schema.Literal(false) }),
  Schema.Struct({ cancelled: Schema.Literal(false), shipped: Schema.Literal(true) }),
]);
const decodeLegacyFlags = Schema.decodeUnknownSync(LegacyOrderState, {
  onExcessProperty: "error",
});

export function decodeLegacyOrderState(input: unknown): OrderState {
  const flags = decodeLegacyFlags(input);
  return Match.value(flags).pipe(
    Match.when({ cancelled: true }, () => Cancelled.make({})),
    Match.when({ shipped: true }, () => Shipped.make({})),
    Match.orElse(() => Open.make({})),
  );
}

export function encodeLegacyOrderState(state: OrderState) {
  const validated = Schema.decodeUnknownSync(OrderState, { onExcessProperty: "error" })(state);
  return Match.value(validated).pipe(Match.tagsExhaustive({
    Open: () => ({ cancelled: false, shipped: false }),
    Shipped: () => ({ cancelled: false, shipped: true }),
    Cancelled: () => ({ cancelled: true, shipped: false }),
  }));
}

const validateOpen = Schema.decodeUnknownSync(Open, { onExcessProperty: "error" });

export function shipOrder(state: Open) {
  validateOpen(state);
  return Shipped.make({});
}

export function cancelOrder(state: Open) {
  validateOpen(state);
  return Cancelled.make({});
}
