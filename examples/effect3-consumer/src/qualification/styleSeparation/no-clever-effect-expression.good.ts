import { Effect } from "effect";
const wrappedWorkflow = Effect.gen(function* () { return 1; });
const decorated = wrappedWorkflow.pipe(Effect.withSpan("wrapped"));
function buildWrapped() { return decorated; }
export const wrapped = buildWrapped();
const workflow = Effect.gen(function* () { return String(Math.abs(-1)); });
export const nested = Effect.catchAll(workflow, () => Effect.succeed("1"));
export const piped = workflow.pipe(Effect.catchAll(() => Effect.succeed("1")));
// Depth three is below threshold; a deep single pillar is also clean.
export const shallow = Effect.catchAll(Effect.gen(function* () { return "1"; }), () => Effect.succeed("1"));
export const pureWorkflow = Effect.gen(function* () { return String(Math.abs(Number("1"))); });
