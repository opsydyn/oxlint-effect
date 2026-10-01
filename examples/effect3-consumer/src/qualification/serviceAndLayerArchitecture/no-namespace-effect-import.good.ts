import { Effect } from "effect";
import { succeed } from "effect/Effect";
import { identity } from "effect/Function";
import * as Local from "./namespace-local";
export const program = Effect.map(succeed(Local.value), identity);
