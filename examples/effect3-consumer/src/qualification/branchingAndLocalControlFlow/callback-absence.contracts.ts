import { Effect, Option, Schema } from "effect";
import * as arrow from "./no-return-in-arrow.bad";
import * as callback from "./no-return-in-callback.bad";
import * as good from "./callbacks.good";
import * as badNull from "./no-return-null.bad";
import * as goodNull from "./absence.good";
import { positive } from "./schema-callback.good";
for (const values of [arrow.mapped, arrow.unused, callback.mapped, callback.unused, good.mapped, good.opaque]) if (values.join() !== "42") throw new Error("Callback output changed");
for (const values of [arrow.branched, callback.branched, good.branched]) if (values.join() !== "42,0") throw new Error("Branch callback changed");
if (arrow.multiple !== 42 || (await Promise.all(callback.asynchronous)).join() !== "42") throw new Error("Multiple/async callback changed");
for (const task of [arrow.task, callback.task, good.task, good.generator]) if (await Effect.runPromise(task) !== 42) throw new Error("Effect callback changed");
if (good.object.map(1) !== 42 || badNull.unused() !== 42) throw new Error("Opaque callback changed");
if (badNull.absent() !== Option.getOrNull(goodNull.absent()) || badNull.block() !== Option.getOrNull(goodNull.absent()) || await Effect.runPromise(badNull.task) !== Option.getOrNull(await Effect.runPromise(goodNull.task)) || badNull.mapped[0] !== Option.getOrNull(goodNull.absent())) throw new Error("Wire absence changed");
if (!Option.isNone(goodNull.absent()) || Option.getOrNull(goodNull.present()) !== 42) throw new Error("Absence lost its data model");
if (Schema.decodeUnknownSync(positive)(42) !== 42) throw new Error("Filter accepted value changed");
for (const value of [0, -1, "42"]) { let rejected = false; try { Schema.decodeUnknownSync(positive)(value); } catch { rejected = true; } if (!rejected) throw new Error("Filter accepted invalid data"); }
