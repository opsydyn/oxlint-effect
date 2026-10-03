import { Effect, Schema } from "effect";
// Legacy catch exists but has discriminator/options arguments, not current broad recovery.
Effect.catch;
// @ts-expect-error Current broad catch signature is not the legacy discriminator API.
Effect.catch(() => Effect.succeed(42));
// @ts-expect-error Eager catch is absent from legacy Effect.
Effect.catchEager;
// @ts-expect-error Current JSON schema constructor is absent from legacy Effect.
Schema.fromJsonString;
