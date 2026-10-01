import { Effect } from "effect";
export class DatabaseService extends Effect.Service<DatabaseService>()("Database", { sync: () => ({ value: 42 }) }) {}
// linteffect/require-service-dependencies: effect builder yields a *Service identifier.
export class EffectBuilder extends Effect.Service<EffectBuilder>()("EffectBuilder", {
  effect: Effect.gen(function* () { const db = yield* DatabaseService; return { value: db.value }; })
}) {}
// linteffect/require-service-dependencies: scoped builder has the same declaration policy.
export class ScopedBuilder extends Effect.Service<ScopedBuilder>()("ScopedBuilder", {
  scoped: Effect.gen(function* () { const db = yield* DatabaseService; return { value: db.value }; })
}) {}
