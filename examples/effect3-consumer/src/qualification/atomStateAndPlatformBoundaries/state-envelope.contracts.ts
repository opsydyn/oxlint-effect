import { Effect, Exit, Ref } from "effect";
import { initial, State } from "./state-model";
const absent = State.make({ count: 41, items: {} });
import * as bad from "./no-naked-object-state-update.bad";
import * as good from "./state-rebuild.good";
import * as envelopeBad from "./no-wrapgraphql-catchall.bad";
import * as envelopeGood from "./envelope-mapping.good";
import { original, rejected, success } from "./envelope";
const left = await Effect.runPromise(Ref.make(initial)); const right = await Effect.runPromise(Ref.make(initial));
await Effect.runPromise(bad.update(left)); await Effect.runPromise(good.update(right));
const l = await Effect.runPromise(Ref.get(left)); const r = await Effect.runPromise(Ref.get(right));
if (l.count !== 42 || r.count !== 42 || l.items.answer !== r.items.answer || initial.count !== 41) throw new Error("State update/immutability changed");
if (await Effect.runPromise(bad.modify(left)) !== await Effect.runPromise(good.modify(right))) throw new Error("Modify return value changed");
if ((await Effect.runPromise(Ref.get(left))).count !== (await Effect.runPromise(Ref.get(right))).count) throw new Error("Modify state changed");
if (bad.assign(initial).count !== good.next(initial).count || bad.entries(initial).count !== initial.count) throw new Error("State rebuild changed");
if (good.updateItem(initial).items.answer !== 42 || good.incrementItem(initial).items.answer !== 42 || "answer" in good.removeItem(initial).items || initial.items.answer !== 41) throw new Error("Record transition changed");
if ("answer" in good.incrementItem(absent).items) throw new Error("Missing key fallback fabricated an item");
if (good.encode(initial) !== bad.encode(initial) || good.decode(bad.encode(initial)).count !== 41) throw new Error("Schema wire shape changed");
for (const wire of ['{"count":"wrong","items":{}}', "not JSON"]) {
  let rejected = false; try { good.decode(wire); } catch { rejected = true; }
  if (!rejected) throw new Error("Boundary validation missing");
}
for (const task of [envelopeBad.wrapped, envelopeBad.free, envelopeBad.before, envelopeBad.unused, envelopeBad.response(rejected), envelopeBad.response(success), envelopeGood.response(success), envelopeGood.successful]) if (await Effect.runPromise(task) !== 42) throw new Error("Envelope success/fallback counterexample changed");
for (const task of [envelopeGood.wrapped, envelopeGood.response(rejected)]) {
  const exit = await Effect.runPromiseExit(task);
  if (!Exit.isFailure(exit)) throw new Error("Envelope failure disappeared");
  const error = exit.cause._tag === "Fail" ? exit.cause.error : undefined;
  if (error !== original) throw new Error("Original typed failure changed");
}
