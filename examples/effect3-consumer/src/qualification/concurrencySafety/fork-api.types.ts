import { Effect } from "effect";
// @ts-expect-error Effect 3 has no forkChild API.
Effect.forkChild(Effect.succeed(42));
// @ts-expect-error Effect 3 has no forkDetach API.
Effect.forkDetach(Effect.succeed(42));
// @ts-expect-error Legacy fork has no v4 startup-options argument.
Effect.fork(Effect.succeed(42), { startImmediately: true });
