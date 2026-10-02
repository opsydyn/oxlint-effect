import { Context, Effect, Layer } from "effect";
interface RepoShape { readonly load: () => Effect.Effect<number> }
export class Repo extends Context.Service<Repo, RepoShape>()("Q29Repo") {}
export class Store extends Context.Service<Store>()("Q29Store", { make: Effect.gen(function* () { const repo = yield* Repo; return { load: repo.load }; }) }) {
  // Explicit project convention, not a generated Effect 4 Default API.
  static readonly Default: Layer.Layer<Store, never, Repo> = Layer.effect(Store, Store.make);
}
export const RepoLive = Layer.succeed(Repo, { load: () => Effect.succeed(42) });
export const program = Effect.gen(function* () { const store = yield* Store; return yield* store.load(); });
