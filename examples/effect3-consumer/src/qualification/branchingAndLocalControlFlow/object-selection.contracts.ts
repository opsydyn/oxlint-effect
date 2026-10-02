import { Option } from "effect";
import * as bad from "./no-branch-in-object.bad";
import * as good from "./object-selection.good";
for (const value of [bad.match.value, bad.option.value, bad.result.value, bad.nested.inner.value, bad.many.a, bad.many.b, bad.unused.read(), bad.array.values[0], bad.method.read(), bad.spread.value, good.value.value, good.nested.inner.value, good.many.a, good.many.b, good.array.values[0], good.key.value, good.alias.value, good.computed.value, good.free.value, good.opaque.read()]) if (value !== 42) throw new Error("Q48 selection/context changed");
if (bad.failure.error !== bad.original || good.repairedFailure(bad.original).error !== bad.original) throw new Error("Object error identity changed");
if (bad.absent.value !== 0 || good.option(Option.none()).value !== bad.absent.value || good.option(Option.some(42)).value !== bad.option.value) throw new Error("Object absence changed");
