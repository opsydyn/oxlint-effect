import { Effect } from "effect";
import { operation, traced } from "./no-effect-fn-generator.good";
import { flat, composed } from "./no-nested-effect-gen.good";
import { delegated, contextual, nestedFunction } from "./no-yield-without-star-in-effect-gen.good";
for (const program of [operation(), traced(), flat, composed, delegated, contextual, nestedFunction]) if (await Effect.runPromise(program) !== "ready") throw new Error("Generator repair value changed");
// Qualification of diagnostic rationale: v4 plain yield executes, but is prohibited by style.
import { plain } from "./no-yield-without-star-in-effect-gen.bad";
if (await Effect.runPromise(plain) !== "done") throw new Error("V4 plain-yield interpreter assumption changed");
console.log("Generator repair and interpreter contracts passed");
