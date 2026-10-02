import { Effect } from "effect";
export const atBoundary = () => Effect.runPromise(Effect.succeed(42));
