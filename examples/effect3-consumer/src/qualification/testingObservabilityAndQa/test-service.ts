import { Context, Effect, Layer } from "effect";
interface RepoShape { readonly load: () => Effect.Effect<number> }
export class Repo extends Context.Tag("Q29Repo")<Repo, RepoShape>() {}
export class Store extends Effect.Service<Store>()("Q29Store", { effect: Effect.gen(function* () { const repo = yield* Repo; return { load: repo.load }; }) }) {}
export const RepoLive = Layer.succeed(Repo, { load: () => Effect.succeed(42) });
export const program = Effect.gen(function* () { const store = yield* Store; return yield* store.load(); });
