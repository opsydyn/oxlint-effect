import { Effect, Exit } from "effect";
import * as piped from "./no-piped-yield-in-gen.bad";
import * as steps from "./no-piped-yield-in-gen.good";
import * as badMap from "./no-gen-for-mapping.bad";
import * as goodMap from "./no-gen-for-mapping.good";
import * as badFlow from "./prefer-gen-for-workflow.bad";
import * as goodFlow from "./prefer-gen-for-workflow.good";
for (const task of [piped.two, piped.three, piped.nested, piped.unused, steps.named, steps.one, badMap.simple(Effect.succeed(1)), goodMap.simple(Effect.succeed(1)), badMap.constant, goodMap.identity, goodMap.extra, goodMap.opaque, badFlow.free, badFlow.selected, goodFlow.short, goodFlow.alias]) {
 if (await Effect.runPromise(task) !== 42) throw new Error("Workflow value changed");
}
for (const task of [badMap.object(Effect.succeed(1)), goodMap.object(Effect.succeed(1))]) if ((await Effect.runPromise(task)).count !== 42) throw new Error("Mapping shape changed");
let calls = 0;
if (await Effect.runPromise(badMap.called(n => { calls++; return n + 41; })) !== 42 || calls !== 1) throw new Error("Called transform is not assumed pure");
const events: number[] = [];
if (await Effect.runPromise(badFlow.workflow(Effect.succeed(1), events)) !== 42 || events.join() !== "2") throw new Error("Original event order changed");
events.length = 0;
if (await Effect.runPromise(goodFlow.workflow(Effect.succeed(1), events)) !== 42 || events.join() !== "2") throw new Error("Generator event order changed");
const original = { _tag: "Q37Failure", requestId: "q37" };
for (const task of [badMap.simple(Effect.fail(original)), goodMap.simple(Effect.fail(original)), badFlow.workflow(Effect.fail(original), events), goodFlow.workflow(Effect.fail(original), events)]) {
 events.length = 0;
 if (!Exit.isFailure(await Effect.runPromiseExit(task)) || await Effect.runPromise(Effect.flip(task)) !== original || events.length !== 0) throw new Error("Failure identity/short circuit changed");
}
