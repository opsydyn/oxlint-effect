import { Effect } from "effect";
// linteffect/no-overloaded-options-object: recognised names with any/object.
export function first(opts: any) { return Effect.succeed(opts); }
export const arrow = (options: object) => options;
export const expression = function(config: object) { return config; };
export function multiple(opts: any, options: object) { return [opts, options]; }
