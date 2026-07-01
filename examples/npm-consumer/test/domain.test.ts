import { Effect } from "effect";
import { program } from "../src/domain.js";

export const testRunBoundary = Effect.runPromise(program);
