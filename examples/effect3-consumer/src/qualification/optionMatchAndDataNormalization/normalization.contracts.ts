import { Effect, Exit, Option, Either } from "effect";
import { decodeFlags, enabled } from "./decoded-model";
import { normalize, reversed } from "./no-option-boolean-normalization.bad";
import * as domain from "./no-string-sentinel-return.good";
for (const value of [true, false, undefined]) {
 const option = value === undefined ? Option.none<boolean>() : Option.some(value);
 const flags = await Effect.runPromise(decodeFlags(value === undefined ? {} : { enabled: value }));
 if (enabled(flags) !== normalize(option) || normalize(option) !== reversed(option)) throw new Error("Boolean normalisation changed valid values");
}
for (const value of ["true", 1, null]) {
 if (normalize(Option.some(value)) !== false || !Exit.isFailure(await Effect.runPromiseExit(decodeFlags({ enabled: value })))) throw new Error("Malformed boolean contrast changed");
}
const present = await Effect.runPromise(domain.present);
const absent = await Effect.runPromise(domain.absent);
if (!Option.isSome(present) || present.value !== 42 || !Option.isNone(absent)) throw new Error("Domain absence/value changed");
const state = await Effect.runPromise(domain.state);
if (state._tag !== "Ready" || state.value !== 42) throw new Error("Tagged state lost value");
const accepted = await Effect.runPromise(domain.accepted);
const rejected = await Effect.runPromise(domain.rejected);
if (!Either.isRight(accepted) || accepted.right !== 42 || !Either.isLeft(rejected) || rejected.left !== domain.failure || rejected.left.requestId !== "q36") throw new Error("Result domain outcome lost value/failure identity");
if (await Effect.runPromise(domain.stored) !== "ready" || await Effect.runPromise(domain.template) !== "ready") throw new Error("Clean syntax gap changed sentinel");
