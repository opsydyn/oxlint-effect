import { Context, Effect } from "effect";
import { DatabasePool, openConnection } from "./pool-support";
export function runPromise() {
  const client = openConnection();
  // @lint-expect linteffect/no-run-with-open-resource
  return Effect.runPromise(Effect.succeed(client.read()));
}
export function runPromiseExit() {
  const client = openConnection();
  // @lint-expect linteffect/no-run-with-open-resource
  return Effect.runPromiseExit(Effect.succeed(client.read()));
}
export function runSync() {
  const client = openConnection();
  // @lint-expect linteffect/no-run-with-open-resource
  return Effect.runSync(Effect.succeed(client.read()));
}
export function runSyncExit() {
  const client = openConnection();
  // @lint-expect linteffect/no-run-with-open-resource
  return Effect.runSyncExit(Effect.succeed(client.read()));
}
export function runFork() {
  const client = openConnection();
  // @lint-expect linteffect/no-run-with-open-resource
  return Effect.runFork(Effect.succeed(client.read()));
}
export function runCallback() {
  const client = openConnection();
  // @lint-expect linteffect/no-run-with-open-resource
  return Effect.runCallback(Effect.succeed(client.read()), { onExit: () => {} });
}
export function scopedRun() {
  const client = openConnection();
  // @lint-expect linteffect/no-run-with-open-resource: sibling scoped effect does not own this raw resource.
  return Effect.runPromise(Effect.scoped(Effect.succeed(client.read())));
}
export function constructed() {
  const client = new DatabasePool();
  // @lint-expect linteffect/no-run-with-open-resource
  return Effect.runSync(Effect.succeed(client.read()));
}
export function afterRun() {
  // @lint-expect linteffect/no-run-with-open-resource: retained lexical co-occurrence false positive.
  const result = Effect.runSync(Effect.succeed(42));
  const client = openConnection(); client.close();
  return result;
}
export function gated<E>(wait: Effect.Effect<number, E>) {
  const client = openConnection();
  // @lint-expect linteffect/no-run-with-open-resource
  return Effect.runPromiseExit(Effect.map(wait, delta => client.read() + delta));
}
export function runPromiseWith() {
  const client = openConnection();
  // @lint-expect linteffect/no-run-with-open-resource
  return Effect.runPromiseWith(Context.empty())(Effect.succeed(client.read()));
}
export function runPromiseExitWith() {
  const client = openConnection();
  // @lint-expect linteffect/no-run-with-open-resource
  return Effect.runPromiseExitWith(Context.empty())(Effect.succeed(client.read()));
}
export function runSyncWith() {
  const client = openConnection();
  // @lint-expect linteffect/no-run-with-open-resource
  return Effect.runSyncWith(Context.empty())(Effect.succeed(client.read()));
}
