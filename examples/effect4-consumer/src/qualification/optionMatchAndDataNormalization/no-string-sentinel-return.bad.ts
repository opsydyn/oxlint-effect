import { Effect } from "effect";
// linteffect/no-string-sentinel-return: every direct literal, not only status vocabulary.
export const status = Effect.succeed("ready");
export const empty = Effect.succeed("");
export const ordinary = Effect.succeed("A legitimate display value");
export const unused = () => Effect.succeed("pending");
