import { Effect, Exit, Option, Schema } from "effect";
import { Flags, ExactFlags, decodeFlags, enabled } from "./decoded-model";
import * as bad from "./no-fromnullable-nullish-coalesce.bad";
import { direct } from "./no-fromnullable-nullish-coalesce.good";
import { drift } from "./no-model-overlay-cast.bad";
if (typeof drift.count !== "string") throw new Error("Assertion unexpectedly validated model");
if (!Exit.isFailure(await Effect.runPromiseExit(Schema.decodeUnknownEffect(ExactFlags)({ enabled: undefined })))) throw new Error("Exact optional key accepted undefined");
for (const input of [null, undefined, false, 0, "", 42]) {
 const repaired = direct(input);
 for (const original of [bad.nullWrap(input), bad.undefinedWrap(input), bad.nested(input)]) {
  if (Option.isSome(original) !== Option.isSome(repaired)) throw new Error("Presence changed");
  if (Option.isSome(original) && Option.isSome(repaired) && original.value !== repaired.value) throw new Error("Falsy value changed");
 }
}
for (const input of [{}, { enabled: undefined }, { enabled: false }, { enabled: true }]) {
 const flags = await Effect.runPromise(decodeFlags(input));
 if (enabled(flags) !== (input.enabled === true)) throw new Error("Boolean optionality changed");
 const encoded = Schema.encodeSync(Flags)(flags);
 if (encoded.enabled !== input.enabled) throw new Error("Boolean wire shape changed");
}
for (const input of [{ enabled: "false" }, { enabled: null }, { enabled: 0 }]) {
 if (!Exit.isFailure(await Effect.runPromiseExit(decodeFlags(input)))) throw new Error("Malformed boolean crossed schema");
}
