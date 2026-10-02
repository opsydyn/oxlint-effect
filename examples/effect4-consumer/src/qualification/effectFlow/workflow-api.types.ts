import { Effect } from "effect";
// @ts-expect-error zipRight was removed in current API.
Effect.zipRight(Effect.succeed(1), Effect.succeed(42));
Effect.flatMapEager(Effect.succeed(1), n => Effect.succeed(n + 41));
