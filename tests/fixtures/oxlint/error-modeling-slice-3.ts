import { Effect } from "effect";

declare const program: Effect.Effect<string, { readonly _tag: "Original" }, never>;
declare const fallbackValue: string | undefined;

export const earlyNull = Effect.catchAll(
  program,
  () => Effect.succeed(null),
);

export const earlyUndefined = Effect.catchAll(
  program,
  () => Effect.succeed(undefined),
);

export const earlyFallback = Effect.catchAll(
  program,
  () => Effect.succeed(fallbackValue),
);

export const expectedNotFound = Effect.fail("NotFound");
export const expectedMissing = Effect.fail("Missing");

export const thrownDomainError = Effect.gen(function* () {
  if (fallbackValue === undefined) {
    throw new ValidationError("missing value");
  }
  return fallbackValue;
});

declare class ValidationError extends Error {}
