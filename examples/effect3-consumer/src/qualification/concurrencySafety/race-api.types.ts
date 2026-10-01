import { Effect } from "effect";
// @ts-expect-error raceAllFirst is a v4 API, unlike raceFirst which exists in both.
Effect.raceAllFirst([Effect.succeed(42), Effect.never]);
