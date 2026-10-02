import { Context, Effect } from "effect";
import { FileSystem } from "effect";
const unprovided = Effect.gen(function* () { const fs = yield* FileSystem.FileSystem; return yield* fs.readFileString("fixture"); });
// @ts-expect-error FileSystem must be provided before execution.
Effect.runPromise(unprovided);
// @ts-expect-error Legacy catchAll is absent.
Effect.catchAll(Effect.fail("error"), () => Effect.succeed(42));
// @ts-expect-error Empty context does not satisfy FileSystem.
Effect.runPromiseWith(Context.empty())(unprovided);
