import { Effect, Exit, Option, Layer } from "effect";
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
for (const make of [methodsBad.Annotated.make, methodsBad.Chained.make, methodsBad.Constructed.make, methodsBad.AsyncKey.make()]) {
  if (await (await Effect.runPromise(make)).load() !== 42) throw new Error("Promise source result changed");
}
if (await (await Effect.runPromise(methodsBad.Traced.make())).load() !== 42) throw new Error("Traced make source changed");
if (await Effect.runPromise((await Effect.runPromise(methodsGood.Traced.make())).load()) !== 42) throw new Error("Traced make repair changed");
for (const make of [methodsGood.Annotated.make, methodsGood.Chained.make, methodsGood.Constructed.make, methodsGood.AsyncKey.make(), methodsGood.OwnScope.make, methodsGood.Named.make]) {
  const service = await Effect.runPromise(make);
  if (await Effect.runPromise(service.load()) !== 42) throw new Error("Effect method result changed");
}
if (await Effect.runPromise(Effect.gen(function* () { return yield* (yield* methodsGood.Annotated).load(); }).pipe(Effect.provide(methodsGood.AnnotatedLive))) !== 42) throw new Error("Contextual method result changed");
const failure = await Effect.runPromiseExit((await Effect.runPromise(methodsGood.Rejected.make)).load());
const rejectedSource = await (await Effect.runPromise(methodsBad.Rejected.make)).load().then(() => undefined, cause => cause);
if (rejectedSource !== original) throw new Error("Promise source failure changed");

if (!Exit.isFailure(failure)) throw new Error("Rejected method swallowed failure");
const error = Exit.findErrorOption(failure);
if (!Option.isSome(error) || error.value !== original) throw new Error("Method failure identity changed");
