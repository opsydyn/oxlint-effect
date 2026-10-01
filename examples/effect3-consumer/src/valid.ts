import { Effect } from "effect";

export class OperationFailed extends Error {
  readonly _tag = "OperationFailed";
}
export const structuredFailure = Effect.fail(new OperationFailed("operation failed"));
export const success = Effect.succeed(1);
