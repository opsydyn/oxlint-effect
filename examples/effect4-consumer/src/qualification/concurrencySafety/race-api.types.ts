import { Effect } from "effect";
// @ts-expect-error v4 removed raceWith; race/raceFirst offer onWinner options instead.
Effect.raceWith(Effect.succeed(42), Effect.never, {});
