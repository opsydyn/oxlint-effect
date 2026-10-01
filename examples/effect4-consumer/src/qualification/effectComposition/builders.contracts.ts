import { Effect } from "effect";
import * as mapped from "./no-effect-as.good";
import * as sequenced from "./no-effect-do.good";
import * as bound from "./no-effect-bind.good";
for (const program of [mapped.direct, mapped.piped]) if (await Effect.runPromise(program) !== "ready") throw new Error("Mapped result changed");
for (const program of [sequenced.piped, bound.direct, bound.piped]) if ((await Effect.runPromise(program)).value !== 1) throw new Error("Bound result shape changed");
console.log("Builder repair contracts passed");
