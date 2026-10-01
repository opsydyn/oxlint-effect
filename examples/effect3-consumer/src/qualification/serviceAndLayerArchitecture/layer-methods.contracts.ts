import { Effect, Exit, Cause, Option, Layer } from "effect";
import * as handlersBad from "./no-layer-merge-in-request-handler.bad";
import * as handlersGood from "./no-layer-merge-in-request-handler.good";
import * as pipesBad from "./prefer-layer-pipe.bad";
import * as pipesGood from "./prefer-layer-pipe.good";
import { read } from "./layer-graph";
import { original } from "./method-failure";
import * as methodsBad from "./no-service-method-returning-promise.bad";
import * as methodsGood from "./no-service-method-returning-promise.good";
for (const make of [handlersBad.readHandler, handlersBad.createRoute, handlersBad.handleRequest, handlersGood.readHandler, handlersGood.createRoute, handlersGood.handleRequest, handlersGood.buildApplicationLayer, handlersGood.arrowRoute]) {
  await Effect.runPromise(Effect.scoped(Layer.build(make())));
}
for (const layer of [pipesBad.two, pipesBad.three, pipesGood.two, pipesGood.three, pipesGood.provider]) {
  if (await Effect.runPromise(read.pipe(Effect.provide(layer))) !== 42) throw new Error("Layer provision repair changed service value");
}
for (const value of [
  await Effect.runPromise(Effect.gen(function* () { const service = yield* methodsBad.Annotated; return yield* Effect.promise(() => service.load()); }).pipe(Effect.provide(methodsBad.Annotated.Default))),
  await Effect.runPromise(Effect.gen(function* () { const service = yield* methodsBad.Resolved; return yield* Effect.promise(() => service.load()); }).pipe(Effect.provide(methodsBad.Resolved.Default)))
]) if (value !== 42) throw new Error("Promise source result changed");
const rejected = await Effect.runPromise(Effect.gen(function* () { return yield* methodsBad.Rejected; }).pipe(Effect.provide(methodsBad.Rejected.Default)));
const rejectedSource = await rejected.load().then(() => undefined, cause => cause);
if (rejectedSource !== original) throw new Error("Promise source failure changed");
for (const value of [
  await Effect.runPromise(Effect.gen(function* () { return yield* (yield* methodsGood.Annotated).load(); }).pipe(Effect.provide(methodsGood.Annotated.Default))),
  await Effect.runPromise(Effect.gen(function* () { return yield* (yield* methodsGood.Resolved).load(); }).pipe(Effect.provide(methodsGood.Resolved.Default)))
]) if (value !== 42) throw new Error("Effect method result changed");
const failure = await Effect.runPromiseExit(Effect.gen(function* () { return yield* (yield* methodsGood.Rejected).load(); }).pipe(Effect.provide(methodsGood.Rejected.Default)));

if (!Exit.isFailure(failure)) throw new Error("Rejected method swallowed failure");
const error = Cause.failureOption(failure.cause);
if (!Option.isSome(error) || error.value !== original) throw new Error("Method failure identity changed");
