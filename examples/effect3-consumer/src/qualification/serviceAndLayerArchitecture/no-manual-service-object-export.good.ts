import { Effect } from "effect";
export class PublicService extends Effect.Service<PublicService>()("Public", {
  sync: () => ({ load: () => Effect.succeed(42) }), accessors: true
}) {}
// Naming/shape controls retain the existing syntax policy.
export const metadataService = { value: 42 };
export const utilities = { load: () => Effect.succeed(42) };
const PrivateService = { load: () => Effect.succeed(42) };
export const privateProgram = PrivateService.load();
const ExportedAliasService = { load: () => Effect.succeed(42) };
export { ExportedAliasService };
