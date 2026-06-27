import { Effect, Match, Option, Ref, Runtime, pipe } from "effect";

declare const count: number;
declare const applyResponse: (value: unknown) => unknown;
declare const runtime: Runtime.Runtime<never>;
declare const SomeRuntime: any;
declare const SomeRuntimeLive: any;
declare function wrapGraphqlCall(input: unknown): any;
declare function invalidate(key: string): void;
declare function setState(value: unknown): void;

// EXPECT: linteffect/no-switch-statement
// QA: Switch statements in Effect files should warn.
switch (count) {
  case 0:
    break;
  default:
    break;
}

// EXPECT: linteffect/no-effect-as
// QA: Effect.as wrappers should warn.
const asWrapper = Effect.as(Effect.succeed(count), "done");

// EXPECT: linteffect/no-effect-do
// QA: Effect.Do member access should warn.
const builderState = Effect.Do;

// EXPECT: linteffect/no-effect-bind
// QA: Effect.bind should warn.
const boundProgram = Effect.bind("next", () => Effect.succeed(count));

// EXPECT: linteffect/no-runtime-runfork
// QA: Runtime.runFork should warn.
Runtime.runFork(runtime)(asWrapper);

// EXPECT: linteffect/no-effect-async
// QA: Manual Effect.async bridges should warn.
const callbackBridge = Effect.async<never, never, void>(() => {});

// EXPECT: linteffect/prevent-dynamic-imports
// QA: Dynamic imports should warn.
const lazyModule = import("./lazy-service");

// EXPECT: linteffect/no-nested-effect-call
// QA: Deep nested Effect calls should warn.
const nestedCall = Effect.map(
  Effect.flatMap(Effect.succeed(count), () => Effect.succeed("next")),
  (value) => value,
);

// EXPECT: linteffect/no-effect-ladder
// QA: Deep nested Effect combinators assigned to const should warn.
const effectLadder = Effect.map(
  Effect.flatMap(Effect.succeed(count), () => Effect.succeed("next")),
  (value) => value,
);

// EXPECT: linteffect/no-flatmap-ladder
// QA: Nested Effect.flatMap ladders should warn.
const flatMapLadder = Effect.flatMap(
  Effect.flatMap(Effect.succeed(count), () => Effect.succeed("next")),
  (value) => Effect.succeed(value),
);

// EXPECT: linteffect/no-pipe-ladder
// QA: Nested pipe calls should warn.
const pipeLadder = pipe(count, pipe(count, (value) => value) as any);

// EXPECT: linteffect/no-call-tower
// QA: Nested Effect call towers should warn.
const callTower = Effect.zipRight(
  Effect.succeed(count),
  Effect.succeed("next"),
);

// EXPECT: linteffect/no-effect-orElse-ladder
// QA: Effect.orElse around sequencing chains should warn.
const orElseLadder = Effect.orElse(
  Effect.flatMap(Effect.succeed(count), () => Effect.succeed("next")),
  () => Effect.succeed("fallback"),
);

// EXPECT: linteffect/no-return-null
// QA: Returning null in Effect ecosystem files should warn.
export function missingValue() {
  return null;
}

// EXPECT: linteffect/no-option-as
// QA: Option.as should warn.
const optionAs = Option.as(Option.some(count), "value");

// EXPECT: linteffect/no-effect-never
// QA: Effect.never should warn.
const neverProgram = Effect.never;

// EXPECT: linteffect/no-arrow-ladder
// QA: Nested arrow IIFEs in Effect files should warn.
const arrowLadder = ((value: number) => ((next: number) => next)(value))(count);

// EXPECT: linteffect/no-iife-wrapper
// QA: Inline function IIFEs in Effect files should warn.
const iifeWrapper = ((value: number) => value)(count);

// EXPECT: linteffect/no-return-in-arrow
// QA: Returns inside block-bodied arrow callbacks should warn.
const arrowReturn = pipe(
  count,
  (value) => {
    return value;
  },
);

// EXPECT: linteffect/no-return-in-callback
// QA: Returns inside inline function callbacks should warn.
const callbackReturn = [count].map(function callback(value) {
  return value;
});

// EXPECT: linteffect/no-effect-fn-generator
// QA: Effect.fn generator wrappers should warn.
const fnGenerator = Effect.fn(function* () {
  return yield* Effect.succeed(count);
});

// EXPECT: linteffect/no-effect-sync-console
// QA: console calls inside Effect.sync should warn.
const syncConsole = Effect.sync(() => {
  console.log(count);
});

// EXPECT: linteffect/no-nested-effect-gen
// QA: Nested Effect.gen calls should warn.
const nestedGen = Effect.gen(function* () {
  return yield* Effect.gen(function* () {
    return count;
  });
});

// EXPECT: linteffect/no-match-void-branch
// QA: Match branches returning Effect.void should warn.
const matchVoidBranch = Match.when(true, () => Effect.void);

// EXPECT: linteffect/no-match-effect-branch
// QA: Sequencing inside Match branches should warn.
const matchEffectBranch = Match.value(count).pipe(
  Match.when(1, () => Effect.flatMap(Effect.succeed(count), (value) => Effect.succeed(value))),
);

// EXPECT: linteffect/warn-effect-sync-wrapper
// QA: Expression-bodied Effect.sync wrappers should warn.
const syncWrapper = Effect.sync(() => String(count));

// EXPECT: linteffect/no-effect-side-effect-wrapper
// QA: Effect.as around side effects should warn.
const sideEffectWrapper = Effect.as(console.log(count) as any, "done");

// EXPECT: linteffect/no-effect-all-step-sequencing
// QA: Effect.all with sequential side-effect steps should warn.
const allStepSequencing = Effect.all([
  Ref.set({} as any, count),
], { concurrency: 1 });

// EXPECT: linteffect/no-try-catch
// QA: try/catch in Effect files should warn.
try {
  throw new Error("boom");
} catch {
  console.log("handled");
}

// EXPECT: linteffect/no-effect-wrapper-alias
// QA: Functions returning raw Effect wrappers should warn.
export function wrapperAlias() {
  return Effect.succeed(count);
}

// EXPECT: linteffect/no-wrapgraphql-catchall
// QA: catchAll after wrapGraphqlCall/applyResponse should warn.
const graphqlCatchAll = pipe(
  wrapGraphqlCall({ query: "query" }),
  Effect.catchAll(() => Effect.succeed(count)),
);

// EXPECT: linteffect/no-inline-runtime-provide
// QA: Inline runtime provisioning inside local Effect code should warn.
const inlineRuntimeProvide = Effect.gen(function* () {
  return yield* SomeRuntime.pipe(Effect.provide(SomeRuntimeLive));
});

// EXPECT: linteffect/no-naked-object-state-update
// QA: Raw object spread state patching should warn.
const objectStatePatch = Ref.update({} as any, (state: Record<string, unknown>) => ({
  ...state,
  count,
}));

// EXPECT: linteffect/no-effect-succeed-variable
// QA: Effect.succeed(variable) branch placeholders should warn.
const succeedVariable = Effect.succeed(count);

// Keep declarations referenced so parse-only examples look intentional.
void [
  builderState,
  boundProgram,
  callbackBridge,
  lazyModule,
  nestedCall,
  effectLadder,
  flatMapLadder,
  pipeLadder,
  callTower,
  orElseLadder,
  optionAs,
  neverProgram,
  arrowLadder,
  iifeWrapper,
  arrowReturn,
  callbackReturn,
  fnGenerator,
  syncConsole,
  nestedGen,
  matchVoidBranch,
  matchEffectBranch,
  syncWrapper,
  sideEffectWrapper,
  allStepSequencing,
  wrapperAlias,
  graphqlCatchAll,
  inlineRuntimeProvide,
  objectStatePatch,
  succeedVariable,
  applyResponse,
  invalidate,
  setState,
];
