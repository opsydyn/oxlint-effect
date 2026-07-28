import { Effect } from "effect";

// EXPECT: linteffect/no-console-in-effect-flow
// QA: Effect workflows should log through Effect so observability context is retained.
const startup = Effect.try({
  try: () => {
    console.error("starting user service");
  },
});

// EXPECT: linteffect/no-effect-log-without-structured-context
// QA: Error handlers need an error value, structured fields, or annotateLogs context.
Effect.succeed({ id: "user" }).pipe(
  Effect.catchAll(() => Effect.logError("user load failed")),
);

// EXPECT: linteffect/require-span-on-public-service-method
// EXPECT: linteffect/no-effect-wrapper-alias
// EXPECT: linteffect/no-manual-effect-channels
// QA: Public Effect operations should create a visible trace boundary.
export const loadUser = (): Effect.Effect<{ readonly id: string }, never, never> => Effect.succeed({
  id: "user",
});

void startup;
