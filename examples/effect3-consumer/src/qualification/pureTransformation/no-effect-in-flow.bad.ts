import { Effect, flow } from "effect";
// linteffect/no-effect-in-flow: every effectful argument shape; first report per call.
export const effect = flow((n: number) => Effect.succeed(n + 41));
export const asynchronous = flow(async (n: number) => n + 41);
export const asynchronousExpression = flow(async function(n: number) { return await Promise.resolve(n + 41); });
export const promise = flow((n: number) => Promise.resolve(n + 41));
export const consoleFlow = flow((n: number) => { console.warn("q39", n); return n + 41; });
export const unused = flow((n: number) => { const ignored = () => Effect.succeed(n); return n + 41; });
// Names alone can warn on ordinary values/functions, not only actual runtimes.
export function shadowed(n: number) { const Promise = (n: number) => n + 41; return flow(Promise)(n); }
export const runtimeName = flow((n: number) => { const Runtime = n; return Runtime + 41; });
export const generator = flow(function*(n: number) { yield n; return n + 41; });
