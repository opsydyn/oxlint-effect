import { Context, Effect, Layer } from "effect";
export class PublicService extends Context.Service<PublicService>()("Public", {
  make: Effect.succeed({ load: () => Effect.succeed(42) })
}) {}
export const PublicLive = Layer.effect(PublicService, PublicService.make);
export const FunctionService = Context.Service<{ readonly load: () => Effect.Effect<number> }>("Function");
export const FunctionLive = Layer.succeed(FunctionService, { load: () => Effect.succeed(42) });
// Naming/shape controls retain the existing syntax policy.
export const metadataService = { value: 42 };
export const utilities = { load: () => Effect.succeed(42) };
const PrivateService = { load: () => Effect.succeed(42) };
export const privateProgram = PrivateService.load();
const ExportedAliasService = { load: () => Effect.succeed(42) };
export { ExportedAliasService };
