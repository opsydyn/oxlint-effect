import { Layer } from "effect";
// linteffect/no-layer-merge-in-request-handler: declaration name and inline assembly.
export function readHandler() { return Layer.merge(Layer.empty, Layer.empty); }
export function createRoute() { return Layer.mergeAll(Layer.empty, Layer.empty); }
export function handleRequest() { return Layer.provide(Layer.empty, Layer.empty); }
