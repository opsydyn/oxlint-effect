import { Effect, Option } from "effect";
import * as ifBad from "./no-if-statement.bad";
import * as switchBad from "./no-switch-statement.bad";
import * as ternaryBad from "./no-ternary.bad";
import * as good from "./branching.good";
for (const enabled of [true, false]) {
  if (ifBad.simple(enabled) !== good.selected(enabled) || ternaryBad.selected(enabled) !== good.selected(enabled) || await Effect.runPromise(ternaryBad.task(enabled)) !== await Effect.runPromise(good.task(enabled))) throw new Error("Boolean branch changed");
  for (const allowed of [true, false]) if (ifBad.nested(enabled, allowed) !== good.nested(enabled, allowed) || ternaryBad.nested(enabled, allowed) !== good.nestedTernary(enabled, allowed)) throw new Error("Nested branch changed");
}
for (const n of [0, 1, 2]) if (ifBad.chained(n) !== good.chained(n)) throw new Error("Else-if branch changed");
for (const mode of ["ready", "waiting"] as const) if (switchBad.state(mode) !== good.state(mode)) throw new Error("Exhaustive branch changed");
for (const mode of ["ready", "complete", "unknown"]) if (switchBad.fallback(mode) !== good.fallback(mode)) throw new Error("Fall-through branch changed");
if (ifBad.unused() !== 42 || switchBad.unused() !== 42 || ternaryBad.unused() !== 42) throw new Error("Unused callback counterexample changed");
if (good.optional(Option.some(42)) !== 42 || good.optional(Option.none()) !== 0 || good.outcome(good.success) !== 42 || good.outcome(good.failure) !== good.original) throw new Error("Option/result or error identity changed");
