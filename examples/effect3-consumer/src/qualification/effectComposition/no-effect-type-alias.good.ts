import { Data, Effect } from "effect";
class StorageError extends Data.TaggedError("StorageError")<{ readonly operation: string }> {}
// CLEAN: expose method contracts on the service, not aliases of Effect channels.
export interface TaskService { readonly load: () => Effect.Effect<string, StorageError> }
export const program = Effect.succeed("ready");
export type Program = typeof program;
export type Envelope = { readonly value: string };
