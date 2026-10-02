import { Effect } from "effect";
import * as Fx from "effect/Effect";
import { Reader } from "./business-service";
// Working repair: workflow in one generator; branch values and failure preserved.
export const branch = <E>(source: Effect.Effect<boolean, E>) => Effect.gen(function* () { const enabled = yield* source; if (enabled) return 42; return 0; });
export const service = Effect.gen(function* () { const reader = yield* Reader; return yield* reader.load(); });
// Name-only lookup heuristic misses a real service not ending in Service.
export const opaqueService = Effect.succeed(1).pipe(Effect.flatMap(() => Effect.gen(function* () { const reader = yield* Reader; return yield* reader.load(); })));
export const pure = Effect.succeed(1).pipe(Effect.map(n => n + 41));
// Named callback, aliased operator and ternary shapes remain opaque/allowed.
const callback = (enabled: boolean) => { if (enabled) return Effect.succeed(42); return Effect.succeed(0); };
export const named = Effect.succeed(true).pipe(Effect.flatMap(callback));
export const alias = Effect.succeed(true).pipe(Fx.flatMap(callback));
export const ternary = Effect.succeed(true).pipe(Effect.flatMap(value => Effect.succeed(value ? 42 : 0)));
