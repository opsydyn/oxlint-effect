import { Effect, Option, SynchronizedRef } from "effect";
declare const ref: SynchronizedRef.SynchronizedRef<number>;
// @ts-expect-error Legacy partial modifier takes fallback and Option<Effect>, not Effect<[result, Option<state>]>.
SynchronizedRef.modifySomeEffect(ref, () => Effect.succeed([42, Option.none()] as const));
// @ts-expect-error Legacy detached startup is forkDaemon.
Effect.forkDetach(Effect.succeed(42));
