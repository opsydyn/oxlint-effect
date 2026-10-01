import { Effect } from "effect";
import { adapter } from "./no-effect-async.good";
if (await Effect.runPromise(adapter) !== "ready") throw new Error("Adapter result changed");
