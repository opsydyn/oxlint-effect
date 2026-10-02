import { Effect } from "effect";
import * as E from "effect/Effect";
import { live, program } from "./runtime-service";
// Explicit once-only exported boundary assembly.
export const boundary = Effect.provide(program, live);
// Curried factory/alias shapes are policy gaps, not endorsed local assembly.
const provide = Effect.provide(live);
export const opaque = provide(program);
export const alias = program.pipe(E.provide(live));
