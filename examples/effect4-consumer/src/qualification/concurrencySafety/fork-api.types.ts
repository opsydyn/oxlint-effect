import { Effect } from "effect";
// @ts-expect-error Effect 4 removed fork in favour of forkChild.
Effect.fork(Effect.succeed(42));
// @ts-expect-error Effect 4 removed forkDaemon in favour of forkDetach.
Effect.forkDaemon(Effect.succeed(42));
// @ts-expect-error The v4 startup option is startImmediately, not immediate.
Effect.forkChild(Effect.succeed(42), { immediate: true });
