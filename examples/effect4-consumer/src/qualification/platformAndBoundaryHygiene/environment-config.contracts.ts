import { Effect, Exit } from "effect";
import * as raw from "./no-process-env-direct-read.bad";
import * as repaired from "./no-process-env-direct-read.good";
import { readConfig } from "./config/env.good";
import { readBoundary } from "./server/env.good";
const keys = ["Q27_VALUE", "Q27_DELETE", "Q27_COUNTER"] as const;
const previous = new Map(keys.map(key => [key, process.env[key]]));
try {
  process.env.Q27_VALUE = "42";
  process.env.Q27_DELETE = "remove";
  process.env.Q27_COUNTER = "4";
  for (const read of [raw.direct, raw.computed, raw.computedEnv, () => raw.dynamic("Q27_VALUE"), raw.optional, raw.destructured, () => raw.whole().Q27_VALUE, repaired.opaque, repaired.destructuredProcess, readConfig, readBoundary]) if (read() !== "42") throw new Error("Read-shaped fixture changed value");
  if (!raw.keys().includes("Q27_VALUE") || raw.shadowed() !== "42") throw new Error("Whole/local-process controls changed");
  raw.remove();
  if (process.env.Q27_DELETE !== undefined) throw new Error("Delete false positive changed");
  repaired.compound();
  if (process.env.Q27_COUNTER !== "41") throw new Error("Compound-assignment exclusion changed");
  const owned = Effect.provide(repaired.value, repaired.configLayer("42"));
  if (await Effect.runPromise(owned) !== 42) throw new Error("Config repair changed decoded integer");
  repaired.set("wrong");
  if (await Effect.runPromise(owned) !== 42 || raw.direct() !== "wrong") throw new Error("Owned config changed with ambient state");
  for (const input of [undefined, "wrong"]) {
    const exit = await Effect.runPromiseExit(Effect.provide(repaired.value, repaired.configLayer(input)));
    if (!Exit.isFailure(exit)) throw new Error("Config accepted missing/malformed integer");
  }
} finally {
  for (const [key, value] of previous) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
}
// Environment keys are restored; no external process configuration is changed.
