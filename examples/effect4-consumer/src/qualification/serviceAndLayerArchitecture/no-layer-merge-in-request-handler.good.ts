import { Layer } from "effect";
const live = Layer.mergeAll(Layer.empty, Layer.empty);
export function readHandler() { return live; }
export function createRoute() { return live; }
export function handleRequest() { return live; }
export function buildApplicationLayer() { return Layer.provide(Layer.empty, Layer.empty); }
// Existing declaration/name heuristic does not infer framework callback ownership.
export const arrowRoute = () => Layer.mergeAll(Layer.empty, Layer.empty);
