// Visitor ordering gap, not a repair.
export const beforeImport = Effect.sync(() => console.log("q51"));
const atomRegistry = { get: () => 42 };
export const registryBeforeImport = Effect.sync(() => atomRegistry.get());
import { Effect } from "effect";
