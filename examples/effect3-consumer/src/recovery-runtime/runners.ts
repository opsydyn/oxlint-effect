import { Effect } from "effect";

// These functions are QA anti-patterns and are never executed by the harness.
export function executeInDomain() {
  const program = Effect.succeed("ok");
  // EXPECT: linteffect/no-run-effect-outside-boundary
  Effect.runCallback(program, { onExit: () => {} });
  // EXPECT: linteffect/no-run-effect-outside-boundary
  Effect.runFork(program);
  // EXPECT: linteffect/no-run-effect-outside-boundary
  Effect.runPromise(program);
  // EXPECT: linteffect/no-run-effect-outside-boundary
  Effect.runPromiseExit(program);
  // EXPECT: linteffect/no-run-effect-outside-boundary
  Effect.runSync(program);
  // EXPECT: linteffect/no-run-effect-outside-boundary
  Effect.runSyncExit(program);
}
