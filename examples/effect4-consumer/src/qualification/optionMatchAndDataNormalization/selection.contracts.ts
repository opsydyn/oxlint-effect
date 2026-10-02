import { Effect, Exit, Option } from "effect";
import * as badOption from "./no-option-as.bad";
import * as goodOption from "./no-option-as.good";
import * as badMatch from "./no-match-effect-branch.bad";
import * as goodMatch from "./no-match-effect-branch.good";
import * as voids from "./no-match-void-branch.bad";
import { selected } from "./no-match-void-branch.good";
for (const value of [badOption.direct, badOption.pipe, badOption.mapper(Option.some(1)), goodOption.direct]) {
 if (!Option.isSome(value) || value.value !== 42) throw new Error("Option mapping changed value");
}
if (!Option.isNone(badOption.absent) || !Option.isNone(goodOption.absent)) throw new Error("Mapping lost absence");
for (const value of [true, false]) {
 const expected = value ? 42 : 0;
 if (await Effect.runPromise(badMatch.match(value)) !== expected || await Effect.runPromise(goodMatch.leaf(value)) !== expected) throw new Error("Leaf branch changed value");
 if (await Effect.runPromise(goodMatch.match(value)) !== expected) throw new Error("Common pipeline repair changed value");
 if (await Effect.runPromise(goodMatch.unsafeCommon(value)) !== (value ? 42 : 41)) throw new Error("Unsafe repair counterexample changed");
 if (selected(value) !== await Effect.runPromise(voids.truth(value))) throw new Error("Pure selection changed no-op value");
}
for (const value of [Option.some(1), Option.none<number>()]) {
 const expected = Option.isSome(value) ? 42 : 0;
 if (await Effect.runPromise(badMatch.option(value)) !== expected) throw new Error("Original Option branch changed");
 if (await Effect.runPromise(goodMatch.option(value)) !== expected) throw new Error("Common Option pipeline repair changed value");
}
if (await Effect.runPromise(voids.truth(true)) !== undefined || await Effect.runPromise(voids.truth(false)) !== 42) throw new Error("No-op branch semantics changed");
const original = { _tag: "Q34Failure", requestId: "q34" };
const exit = await Effect.runPromiseExit(Effect.map(Effect.fail(original), n => n));
if (!Exit.isFailure(exit)) throw new Error("Common pipeline recovered failure");
if (await Effect.runPromise(Effect.flip(Effect.map(Effect.fail(original), n => n))) !== original) throw new Error("Common pipeline lost failure identity");
// This repair must explicitly preserve a no-op or branch-specific transformation;
// moving all work outside a branch is not automatically semantically equivalent.
