import { Effect, Layer } from "effect";
import { Current, DatabaseService } from "./legacy-dependencies-exclusion";
import * as namespaceBad from "./no-namespace-effect-import.bad";
import * as namespaceGood from "./no-namespace-effect-import.good";
import * as manualBad from "./no-manual-service-object-export.bad";
import * as manualGood from "./no-manual-service-object-export.good";

const results = [
  await Effect.runPromise(Effect.gen(function* () { return (yield* Current).value; }).pipe(Effect.provide(Layer.effect(Current, Current.make).pipe(Layer.provide(Layer.succeed(DatabaseService, { value: 42 })))))),
  await Effect.runPromise(namespaceBad.program), await Effect.runPromise(namespaceGood.program),
  await Effect.runPromise(manualBad.ArrowService.load()), await Effect.runPromise(manualBad.MethodService.load()),
  await Effect.runPromise(manualBad.FnService.load()), manualBad.PureService.load(),
  await Effect.runPromise(manualGood.utilities.load()), await Effect.runPromise(manualGood.privateProgram),
  await Effect.runPromise(manualGood.ExportedAliasService.load()), manualGood.metadataService.value,
  await Effect.runPromise(Effect.gen(function* () { return yield* (yield* manualGood.PublicService).load(); }).pipe(Effect.provide(manualGood.PublicLive))),
  await Effect.runPromise(Effect.gen(function* () { return yield* (yield* manualGood.FunctionService).load(); }).pipe(Effect.provide(manualGood.FunctionLive)))
];
for (const value of results) if (value !== 42) throw new Error("Import/export/dependency repair changed service value");
