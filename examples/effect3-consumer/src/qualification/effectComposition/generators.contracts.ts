import { Effect } from "effect";
import { operation, traced } from "./no-effect-fn-generator.good";
import { flat, composed } from "./no-nested-effect-gen.good";
import { delegated } from "./no-yield-without-star-in-effect-gen.good";
for (const program of [operation(), traced(), flat, composed, delegated]) if (await Effect.runPromise(program) !== "ready") throw new Error("Generator repair value changed");
console.log("Generator repair and interpreter contracts passed");
