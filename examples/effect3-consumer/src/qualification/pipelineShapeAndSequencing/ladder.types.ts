import { Effect } from "effect";
// @ts-expect-error Current eager API is absent in legacy Effect.
Effect.flatMapEager(Effect.succeed(1), (n: number) => Effect.succeed(n + 41));
