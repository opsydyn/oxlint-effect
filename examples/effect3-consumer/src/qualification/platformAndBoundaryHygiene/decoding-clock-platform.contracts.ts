import { Clock, Effect, Exit, TestClock, TestContext } from "effect";

import * as raw from "./no-json-parse-without-schema.bad";
import * as json from "./no-json-parse-without-schema.good";
import * as deep from "./json-deep.good";
import * as alias from "./json-alias.good";
import * as typeOnly from "./json-type-only.good";
import * as clockBad from "./no-date-now-in-effect.bad";
import * as clock from "./no-date-now-in-effect.good";
import * as platform from "./no-node-platform-in-shared-code.good";
import * as native from "./no-node-platform-in-shared-code.bad";
import * as boundary from "./server/platform.good";
const text = '{"count":42}';
for (const decode of [json.decode, deep.decode, alias.decode]) {
  const value = await Effect.runPromise(decode(text));
  if (value.count !== 42) throw new Error("Schema repair changed valid value");
  for (const malformed of ['{"count":"wrong"}', '{broken']) {
    const exit = await Effect.runPromiseExit(decode(malformed));
    if (!Exit.isFailure(exit)) throw new Error("Schema repair accepted malformed input");
  }
}
for (const value of [raw.raw('{"count":"wrong"}'), await Effect.runPromise(raw.sync('{"count":"wrong"}')), json.markerOnly('{"count":"wrong"}'), await Effect.runPromise(typeOnly.raw('{"count":"wrong"}'))]) if (value.count !== "wrong") throw new Error("Unchecked marker counterexample changed");
await Effect.runPromise(Effect.provide(Effect.gen(function* () {
  yield* TestClock.setTime(1000);
  const first = yield* clock.time;
  const fn = yield* clock.fn();
  yield* TestClock.adjust("1 second");
  const second = yield* Clock.currentTimeMillis;
  if (first !== 1000 || fn !== 1000 || second !== 2000) throw new Error("Clock repair is not deterministic");
}), TestContext.TestContext));
if (await Effect.runPromise(clockBad.unused) !== 42) throw new Error("Unused callback false positive changed");
for (const task of [clockBad.sync, clockBad.gen, clockBad.attempt, clockBad.asyncAttempt, clockBad.fn(), clockBad.named(), clockBad.nested, clockBad.untraced(), clock.opaque, clock.alias]) if (typeof await Effect.runPromise(task) !== "number") throw new Error("Wall-clock counterexample changed type");
if (await Effect.runPromise(Effect.provide(platform.basename("/tmp/fixture"), platform.fixtureLayer)) !== native.path || platform.opaque() !== "fixture" || boundary.name("/tmp/fixture") !== "fixture") throw new Error("Platform service repair changed fixture result");
// Injected path stand-in qualifies this fixture, not OS-wide path semantics.
