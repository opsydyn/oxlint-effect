import { Effect } from "effect";

// EXPECT: linteffect/no-error-as-public-effect-error
// QA: The public contract cannot distinguish a profile operation failure by tag.
export function loadProfile(operation: Effect.Effect<string, Error>): Effect.Effect<string, Error> {
  return operation;
}

// EXPECT: linteffect/no-unknown-public-error-channel
// QA: Callers receive opaque failures with no operation-specific error contract.
export function refreshSession(operation: Effect.Effect<string, unknown>): Effect.Effect<string, unknown> {
  return operation;
}

// EXPECT: linteffect/no-mixed-effect-error-shapes
// QA: This adapter uses strings for validation details and numbers for upstream codes.
export function readInventory(operation: Effect.Effect<number, string | number>): Effect.Effect<number, string | number> {
  return operation;
}
