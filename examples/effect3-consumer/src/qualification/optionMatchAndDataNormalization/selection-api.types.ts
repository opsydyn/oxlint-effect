import { Effect } from "effect";
// Legacy accepts the plain constant; current requires an Effect-returning callback.
Effect.andThen(Effect.succeed(1), 42);
Effect.andThen(Effect.succeed(1), () => Effect.succeed(42));
