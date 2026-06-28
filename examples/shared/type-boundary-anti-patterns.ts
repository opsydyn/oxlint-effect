import { Effect, Match, Option } from "effect";

declare const count: number | boolean;
declare const decoded: unknown;
declare const source: string | null | undefined;
declare const unknownFlag: unknown;

// EXPECT: linteffect/no-manual-effect-channels
// QA: Manual Effect channel tuple types should warn.
export type ManualEffect = Effect.Effect<number, Error, never>;

// EXPECT: linteffect/no-effect-type-alias
// QA: Effect.Effect type aliases should warn.
export type ProgramAlias = Effect.Effect<string, Error, never>;

// EXPECT: linteffect/no-model-overlay-cast
// QA: Asserting decoded model flow with `as` should warn.
const modelOverlay = decoded as { readonly id: string };

// EXPECT: linteffect/no-unknown-boolean-coercion-helper
// QA: Local unknown-to-boolean coercion helpers paired with Match.orElse null should warn.
const booleanCoercion = Match.value(typeof unknownFlag === "boolean").pipe(
  Match.orElse(() => null),
);

// EXPECT: linteffect/no-fromnullable-nullish-coalesce
// QA: Nullish re-wrap inside Option.fromNullable should warn.
const nullableOption = Option.fromNullable(source ?? null);

// EXPECT: linteffect/no-option-boolean-normalization
// QA: Repeated Option boolean normalization should warn.
const booleanNormalized = Option.match(Option.some(count), {
  onSome: (value) => value === true,
  onNone: () => false,
});

// EXPECT: linteffect/no-string-sentinel-return
// QA: Effect.succeed string sentinels should warn.
const stringSentinelReturn = Effect.succeed("loading");

// EXPECT: linteffect/no-string-sentinel-const
// QA: String status constants should warn.
const statusToken = "loading";

void [
  booleanCoercion,
  nullableOption,
  booleanNormalized,
  stringSentinelReturn,
  statusToken,
  modelOverlay,
];
