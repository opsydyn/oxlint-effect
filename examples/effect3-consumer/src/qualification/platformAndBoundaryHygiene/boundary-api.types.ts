import { Effect } from "effect";
import * as FileSystem from "@effect/platform/FileSystem";
const unprovided = Effect.gen(function* () { const fs = yield* FileSystem.FileSystem; return yield* fs.readFileString("fixture"); });
// @ts-expect-error FileSystem must be provided before execution.
Effect.runPromise(unprovided);
// @ts-expect-error Current catch is absent.
Effect.catch(Effect.fail("error"), () => Effect.succeed(42));
// @ts-expect-error Current runner factory is absent.
Effect.runPromiseWith({});
