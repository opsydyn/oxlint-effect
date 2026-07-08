import { Effect, Layer, flow, pipe } from "effect";

declare const program: Effect.Effect<string, never, never>;
declare const id: string;
declare const User: {
  readonly toDto: (user: { readonly id: string }) => { readonly id: string };
};
declare const getUser: (id: string) => Effect.Effect<{ readonly id: string }, never, never>;

// EXPECT: linteffect/no-mixed-pillar-function
// QA: workflow, pure transformation, and Layer wiring should not live in one function.
function mixedStylePillars() {
  return {
    workflow: Effect.gen(function* () {
      return yield* getUser(id);
    }),
    shape: flow(User.toDto, (user) => ({ ...user, label: user.id })),
    layer: Layer.mergeAll(),
  };
}

// EXPECT: linteffect/no-clever-effect-expression
// QA: dense expressions that combine style pillars should become named concepts.
const cleverEffectExpression = pipe(
  Effect.map(
    Effect.gen(function* () {
      return yield* getUser(id);
    }),
    flow(User.toDto, (user) => ({ ...user, label: user.id })),
  ),
  ((value) => value),
);

// EXPECT: linteffect/prefer-extracted-concept
// QA: multi-step callbacks usually hide a named transformation or policy.
const oversizedAnonymousConcept = Effect.map(program, (value) => {
  const normalized = value.trim();
  console.log(normalized);
  return normalized.toUpperCase();
});

void mixedStylePillars;
void cleverEffectExpression;
void oversizedAnonymousConcept;
