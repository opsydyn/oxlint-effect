import { Effect } from "effect";
// @ts-expect-error current andThen does not accept an unwrapped constant.
Effect.andThen(Effect.succeed(1), 42);
Effect.andThen(Effect.succeed(1), () => Effect.succeed(42));
