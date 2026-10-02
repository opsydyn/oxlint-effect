import * as Package from "effect";
// @ts-expect-error current success/failure values use Result, not removed Either.
Package.Either.right(42);
Package.Result.succeed(42);
