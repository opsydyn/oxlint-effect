import { Effect } from "effect";

declare const program: Effect.Effect<string, { readonly _tag: "Original" }, never>;

export const messageFailure = Effect.fail(error.message);
export const concatenatedFailure = Effect.fail("load failed: " + error.message);

export const genericRethrow = Effect.catchAll(
  program,
  (error) => Effect.fail(new Error(error.message)),
);

export const loggedCatchAll = Effect.catchAll(
  program,
  (error) => Effect.logError(error),
);

export const loggedTapError = Effect.tapError(
  program,
  (error) => Effect.logWarning(error),
);

export const mappedFailure = Effect.catchAll(
  program,
  (error) => Effect.fail({ _tag: "MappedFailure", cause: error }),
);

declare const error: { readonly message: string };
