import { Effect } from "effect";
export class DatabaseService extends Effect.Service<DatabaseService>()("Database", { sync: () => ({ value: 42 }) }) {}
export class EffectBuilder extends Effect.Service<EffectBuilder>()("EffectBuilder", {
  effect: Effect.gen(function* () { const db = yield* DatabaseService; return { value: db.value }; }),
  dependencies: [DatabaseService.Default]
}) {}
export class ScopedBuilder extends Effect.Service<ScopedBuilder>()("ScopedBuilder", {
  scoped: Effect.gen(function* () { const db = yield* DatabaseService; return { value: db.value }; }),
  dependencies: [DatabaseService.Default]
}) {}
// Presence, not graph completeness: [] stays clean and needs external provision.
export class External extends Effect.Service<External>()("External", {
  effect: Effect.gen(function* () { const db = yield* DatabaseService; return { value: db.value }; }),
  dependencies: []
}) {}
