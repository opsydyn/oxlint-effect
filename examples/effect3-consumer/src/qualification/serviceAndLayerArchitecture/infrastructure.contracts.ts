import { Effect, Layer } from "effect";
import * as inlineBad from "./no-inline-layer-provide-in-program.bad";
import * as inlineGood from "./no-inline-layer-provide-in-program.good";
import * as mergeBad from "./prefer-layer-mergeall-for-infrastructure.bad";
import * as mergeGood from "./prefer-layer-mergeall-for-infrastructure.good";
import * as scatterBad from "./no-service-layer-scatter.bad";
import * as scatterGood from "./no-service-layer-scatter.good";
import { A, B, C, readAll } from "./infrastructure-graph";
for (const program of [inlineBad.direct, inlineBad.piped, inlineBad.assembled, inlineGood.direct, inlineGood.piped, inlineGood.assembled]) {
  if (await Effect.runPromise(program) !== 42) throw new Error("Workflow repair changed provision order or value");
}
for (const live of [mergeBad.two, mergeBad.three, mergeGood.two, mergeGood.three]) {
  const values = await Effect.runPromise(readAll.pipe(Effect.provide(live)));
  if (values.join(",") !== "1,2,3,4") throw new Error("Merge repair lost service values");
}
const badReads = [
  Effect.map(A, service => service.value).pipe(Effect.provide(scatterBad.FirstLive)),
  Effect.map(B, service => service.value).pipe(Effect.provide(scatterBad.SecondLayer)),
  Effect.map(C, service => service.value).pipe(Effect.provide(scatterBad.ThirdLive))
];
const goodReads = [A, B, C].map(key => Effect.map(key, service => service.value).pipe(Effect.provide(scatterGood.InfrastructureLive)));
for (let index = 0; index < badReads.length; index++) {
  if (await Effect.runPromise(badReads[index]!) !== index + 1 || await Effect.runPromise(goodReads[index]!) !== index + 1) throw new Error("Scatter repair lost service values");
}
for (const program of [scatterBad.FourthLayer, scatterGood.ProgramLayer, scatterGood.ordinary]) {
  if (await Effect.runPromise(program) !== 1) throw new Error("Provided program result changed");
}
await Effect.runPromise(Effect.scoped(Layer.build(mergeGood.pair)));
