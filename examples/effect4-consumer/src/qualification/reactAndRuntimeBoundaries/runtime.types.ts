import { Effect, Runtime } from "effect";
// @ts-expect-error Current Runtime has no runFork export.
Runtime.runFork(Effect.succeed(42));
// @ts-expect-error Current Effect has no legacy orDieWith export.
Effect.orDieWith(Effect.succeed(42), (error: unknown) => error);
