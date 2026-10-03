// Effect 4 first-class asset; qualify against the pinned current consumer.
import { Schema } from "effect";

// EXPECT: linteffect/no-magic-domain-string
// QA: Raw status strings scatter the domain vocabulary.
export function isApproved(order: { readonly status: string }) {
  return order.status === "approved";
}

// EXPECT: linteffect/no-domain-logic-in-conditional
// QA: Eligibility combines three business comparisons without named predicates.
export function canApplyDiscount(order: {
  readonly total: number;
  readonly itemCount: number;
  readonly discountPercentage: number;
}) {
  return order.total > 100 && order.itemCount >= 2 && order.discountPercentage <= 20;
}

// EXPECT: linteffect/no-implicit-state-machine-object
// QA: The intended lifecycle permits neither, cancelled, or shipped, but never both.
export function hasContradictoryState(order: { readonly cancelled: boolean; readonly shipped: boolean }) {
  return order.cancelled && order.shipped;
}

void Schema;
