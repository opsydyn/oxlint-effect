import { Effect, Exit } from "effect";
import { live } from "./business-service";
import * as bad from "./no-business-logic-in-pipe.bad";
import * as good from "./no-business-logic-in-pipe.good";
for (const task of [bad.switchCase, bad.forLoop, bad.forIn, bad.forOf, bad.whileLoop, bad.doLoop, bad.multiple, bad.unused, bad.mapping, bad.twoCallbacks, bad.expression, good.pure, good.named, good.alias, bad.eager]) if (await Effect.runPromise(task) !== 42) throw new Error("Workflow value changed");
for (const task of [bad.service, good.service, good.opaqueService]) if (await Effect.runPromise(Effect.provide(task, live)) !== 42) throw new Error("Service workflow changed");
for (const input of [true, false]) {
 const expected = input ? 42 : 0;
 if (await Effect.runPromise(bad.branch(Effect.succeed(input))) !== expected || await Effect.runPromise(good.branch(Effect.succeed(input))) !== expected) throw new Error("Branch value changed");
}
const original = { _tag: "Q38Failure", requestId: "q38" };
for (const task of [bad.branch(Effect.fail(original)), good.branch(Effect.fail(original))]) {
 if (!Exit.isFailure(await Effect.runPromiseExit(task)) || await Effect.runPromise(Effect.flip(task)) !== original) throw new Error("Workflow failure identity changed");
}
