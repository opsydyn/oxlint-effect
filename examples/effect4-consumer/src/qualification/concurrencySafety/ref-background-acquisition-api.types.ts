import { Effect, Option, SynchronizedRef } from "effect";
declare const ref: SynchronizedRef.SynchronizedRef<number>;
// @ts-expect-error V4 partial modifier has no fallback argument.
SynchronizedRef.modifySomeEffect(ref, 42, (value: number) => Option.some(Effect.succeed([42, value] as const)));
// @ts-expect-error V4 ref has namespace modifiers, not legacy modifyEffect instance method.
ref.modifyEffect((value: number) => Effect.succeed([42, value] as const));
// @ts-expect-error V4 replaced forkDaemon with forkDetach.
Effect.forkDaemon(Effect.succeed(42));
// @ts-expect-error V4 removed the legacy supervised operator.
Effect.supervised(Effect.succeed(42), {});
