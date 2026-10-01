import { Effect, Exit, Option } from "effect";
import { mapping, tracing, timing, recovering, original, eager, cause } from "./prefer-pipe-for-behavior.good";
import { extracted, single } from "./prefer-decorated-effect-before-gen.good";
import { decorated } from "./no-workflow-in-behavior-pipe.good";
if (await Effect.runPromise(mapping) !== "READY") throw new Error("Mapped value changed");
for (const program of [tracing, timing, extracted, single, decorated]) if (await Effect.runPromise(program) !== "ready") throw new Error("Decoration result changed");
for (const program of [recovering, eager, cause]) {
 const exit = await Effect.runPromiseExit(program);
 if (!Exit.isFailure(exit)) throw new Error("Decorated failure swallowed");
 const error = Exit.findErrorOption(exit);
 if (!Option.isSome(error) || error.value !== original) throw new Error("Decoration failure identity changed");
}
console.log("Behaviour decoration contracts passed");
