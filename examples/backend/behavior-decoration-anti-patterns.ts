import { Effect } from "effect";

declare const policy: any;
declare const loadUser: any;
declare const saveUser: any;
declare const getUser: Effect.Effect<{ readonly id: string }, never, never>;

// EXPECT: linteffect/prefer-pipe-for-behavior
// QA: behavior decorators should wrap existing effects through .pipe().
const staticRetryDecorator = Effect.retry(
  Effect.succeed("user-1"),
  policy,
);

// EXPECT: linteffect/prefer-decorated-effect-before-gen
// QA: repeated retry/timeout/span decorators should be named before the workflow generator.
const decoratedInsideGen = Effect.gen(function* () {
  yield* loadUser.pipe(Effect.retry(policy));
  yield* saveUser.pipe(Effect.withSpan("user.save"));
});

// EXPECT: linteffect/no-workflow-in-behavior-pipe
// QA: behavior pipes should not bury workflow sequencing.
const workflowBuriedInBehaviorPipe = getUser.pipe(
  Effect.retry(policy),
  Effect.flatMap(loadUser),
  Effect.andThen(saveUser),
  Effect.timeout("5 seconds"),
);

void staticRetryDecorator;
void decoratedInsideGen;
void workflowBuriedInBehaviorPipe;
