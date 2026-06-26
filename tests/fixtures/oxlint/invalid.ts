import { Effect, Match, Option, Ref, Runtime, pipe } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { useState } from "react";

const count = useState(0);

const program = Effect.as(Effect.succeed(count), "done").pipe(
  Effect.bind("next", () => Effect.succeed("next")),
);

const bridge = Effect.async<never, never, void>(() => {});

const nested = Effect.map(
  Effect.flatMap(Effect.succeed(count), () => Effect.succeed("next")),
  (value) => value,
);

const flatMapLadder = Effect.flatMap(
  Effect.flatMap(Effect.succeed(count), () => Effect.succeed("next")),
  (value) => Effect.succeed(value),
);

const callTower = Effect.zipRight(
  Effect.succeed(count),
  Effect.succeed("next"),
);

const orElseLadder = Effect.orElse(
  Effect.flatMap(Effect.succeed(count), () => Effect.succeed("next")),
  () => Effect.succeed("fallback"),
);

const ternary = count ? "yes" : "no";

function maybeValue() {
  return null;
}

const optionAs = Option.as(Option.some(count), "value");

const neverEffect = Effect.never;

const arrowLadder = ((value) => ((next) => next)(value))(count);

const branchInObject = {
  label: Match.value(count).pipe((value) => value),
};

const iifeWrapper = ((value) => value)(count);

const arrowReturn = pipe(
  count,
  (value) => {
    return value;
  },
);

const callbackReturn = [count].map(function callback(value) {
  return value;
});

const fnGenerator = Effect.fn(function* () {
  return yield* Effect.succeed(count);
});

const syncConsole = Effect.sync(() => {
  console.log(count);
});

const nestedGen = Effect.gen(function* () {
  return yield* Effect.gen(function* () {
    return count;
  });
});

const matchVoidBranch = Match.when(true, () => Effect.void);

const matchEffectBranch = Match.value(count).pipe(
  Match.when(1, () => Effect.flatMap(Effect.succeed(count), (value) => Effect.succeed(value))),
);

const syncWrapper = Effect.sync(() => String(count));

const sideEffectWrapper = Effect.as(console.log(count), "done");

const allStepSequencing = Effect.all([
  Ref.set({} as any, count),
], { concurrency: 1 });

const wrapperAlias = () => Effect.succeed(count);

type ManualEffect = Effect.Effect<number, Error, never>;

const modelOverlay = count as unknown;

const booleanCoercion = Match.value(typeof count === "boolean").pipe(
  Match.orElse(() => null),
);

const nullableOption = Option.fromNullable(count ?? null);

const booleanNormalized = Option.match(Option.some(count), {
  onSome: (value) => value === true,
  onNone: () => false,
});

const statusToken = "loading";

const graphqlCatchAll = pipe(
  wrapGraphqlCall({ query: "query" }),
  Effect.catchAll(() => Effect.succeed(count)),
);

Match.value(count).pipe(
  Match.when(1, () => Effect.succeed(count)),
);

const atomRegistrySync = Effect.sync(() => Atom.set({} as any, count));

const familyCollectionRead = Atom.family((id: string) => get(UsersCollectionAtom));

const inlineRuntimeProvide = Effect.gen(function* () {
  return yield* SomeRuntime.pipe(Effect.provide(SomeRuntimeLive));
});

const objectStatePatch = Ref.update({} as any, (state) => ({
  ...state,
  count,
}));

try {
  throw new Error("boom");
} catch {
  console.log("handled");
}

const pipeLadder = pipe(count, pipe(count, (value) => value));

Runtime.runFork(program);

void import("./lazy");
