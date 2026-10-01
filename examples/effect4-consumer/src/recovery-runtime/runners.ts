import { Context, Effect } from "effect";

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
  const Label = Context.Service<{ readonly value: string }>("QA/Label");
  const context = Context.make(Label, { value: "ok" });
  const contextual = Effect.gen(function* () { return (yield* Label).value; });
  // EXPECT: linteffect/no-run-effect-outside-boundary (execution, not factory)
  Effect.runCallbackWith(context)(contextual, { onExit: () => {} });
  // EXPECT: linteffect/no-run-effect-outside-boundary (execution, not factory)
  Effect.runForkWith(context)(contextual);
  // EXPECT: linteffect/no-run-effect-outside-boundary (execution, not factory)
  Effect.runPromiseWith(context)(contextual);
  // EXPECT: linteffect/no-run-effect-outside-boundary (execution, not factory)
  Effect.runPromiseExitWith(context)(contextual);
  // EXPECT: linteffect/no-run-effect-outside-boundary (execution, not factory)
  Effect.runSyncWith(context)(contextual);
  // EXPECT: linteffect/no-run-effect-outside-boundary (execution, not factory)
  Effect.runSyncExitWith(context)(contextual);
}
