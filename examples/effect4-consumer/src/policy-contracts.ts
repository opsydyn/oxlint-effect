import { Effect } from "effect";
import { CounterLive, operationName, readCounter, type CounterProgram } from "./policy-contracts.good";

const typed: CounterProgram = readCounter();
if (await Effect.runPromise(typed.pipe(Effect.provide(CounterLive))) !== 42) throw new Error("Explicit service contract changed its result");
if (await Effect.runPromise(operationName()) !== "Counter.span") throw new Error("Named Effect.fn lost its automatic span");
console.log("Traced service contracts passed");
