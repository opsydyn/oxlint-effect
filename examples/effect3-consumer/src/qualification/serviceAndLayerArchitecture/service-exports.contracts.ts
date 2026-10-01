import { Effect } from "effect";
import * as namespaceBad from "./no-namespace-effect-import.bad";
import * as namespaceGood from "./no-namespace-effect-import.good";
import * as manualBad from "./no-manual-service-object-export.bad";
import * as manualGood from "./no-manual-service-object-export.good";
import * as dependenciesBad from "./require-service-dependencies.bad";
import * as dependenciesGood from "./require-service-dependencies.good";
const results = [
  await Effect.runPromise(namespaceBad.program), await Effect.runPromise(namespaceGood.program),
  await Effect.runPromise(manualBad.ArrowService.load()), await Effect.runPromise(manualBad.MethodService.load()),
  await Effect.runPromise(manualBad.FnService.load()), manualBad.PureService.load(),
  await Effect.runPromise(manualGood.utilities.load()), await Effect.runPromise(manualGood.privateProgram),
  await Effect.runPromise(manualGood.ExportedAliasService.load()), manualGood.metadataService.value,
  await Effect.runPromise(manualGood.PublicService.load().pipe(Effect.provide(manualGood.PublicService.Default))),
  await Effect.runPromise(Effect.gen(function* () { return (yield* dependenciesBad.EffectBuilder).value; }).pipe(Effect.provide(dependenciesBad.EffectBuilder.Default), Effect.provide(dependenciesBad.DatabaseService.Default))),
  await Effect.runPromise(Effect.gen(function* () { return (yield* dependenciesBad.ScopedBuilder).value; }).pipe(Effect.provide(dependenciesBad.ScopedBuilder.Default), Effect.provide(dependenciesBad.DatabaseService.Default))),
  await Effect.runPromise(Effect.gen(function* () { return (yield* dependenciesGood.EffectBuilder).value; }).pipe(Effect.provide(dependenciesGood.EffectBuilder.Default))),
  await Effect.runPromise(Effect.gen(function* () { return (yield* dependenciesGood.ScopedBuilder).value; }).pipe(Effect.provide(dependenciesGood.ScopedBuilder.Default))),
  await Effect.runPromise(Effect.gen(function* () { return (yield* dependenciesGood.External).value; }).pipe(Effect.provide(dependenciesGood.External.Default), Effect.provide(dependenciesGood.DatabaseService.Default)))
];
for (const value of results) if (value !== 42) throw new Error("Import/export/dependency repair changed service value");
