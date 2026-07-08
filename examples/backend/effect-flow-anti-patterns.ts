import { Effect } from "effect";

declare const policy: any;
declare const loadUser: any;
declare const saveUser: any;
declare const auditUser: any;
declare const getUser: (id: string) => Effect.Effect<{ readonly id: string }, never, never>;
declare const id: string;
declare const User: {
  readonly toDto: (user: { readonly id: string }) => { readonly id: string };
};

// EXPECT: linteffect/no-piped-yield-in-gen
// QA: Effect.gen workflows should yield named steps instead of hiding decorators in each yield.
export const pipedYieldFlow = Effect.gen(function* () {
  yield* loadUser.pipe(Effect.retry(policy));
  yield* saveUser.pipe(Effect.timeout("5 seconds"));
});

// EXPECT: linteffect/no-gen-for-mapping
// QA: One-yield pure mapping belongs in Effect.map or a named pure transformation.
export const genForMapping = Effect.gen(function* () {
  const user = yield* getUser(id);
  return User.toDto(user);
});

// EXPECT: linteffect/prefer-gen-for-workflow
// QA: Long sequencing pipelines should move the workflow story into Effect.gen.
export const longSequencingPipeline = Effect.succeed(id).pipe(
  Effect.flatMap(loadUser),
  Effect.andThen(saveUser),
  Effect.tap(auditUser),
);
