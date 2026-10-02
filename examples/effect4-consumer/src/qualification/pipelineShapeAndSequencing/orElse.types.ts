import { Effect } from "effect";
// @ts-expect-error Effect 4 has no legacy orElse API.
Effect.orElse(Effect.succeed(1), () => Effect.succeed(42));
