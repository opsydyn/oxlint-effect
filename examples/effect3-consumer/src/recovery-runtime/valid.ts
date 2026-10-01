import { Effect } from "effect";

export class SourceError extends Error {
  readonly _tag = "SourceError";
}
export class MappedError extends Error {
  readonly _tag = "MappedError";
  constructor(readonly source: SourceError) { super("mapped", { cause: source }); }
}
export const sourceError = new SourceError("source");
export const propagated = Effect.catchAll(Effect.fail(sourceError), (error) => Effect.fail(error));
export const mapped = Effect.catchAll(Effect.fail(sourceError), (error) => Effect.fail(new MappedError(error)));
export const domainProgram = Effect.succeed("ok");
export const explicitResult = Effect.catchAll(Effect.fail(sourceError), () => Effect.succeed({ _tag: "Missing" }));
// A nested unrelated callback must not be attributed to this handler.
export const unrelatedCallback = Effect.catchAll(Effect.fail(sourceError), (error) => {
  const unused = () => { return Effect.fail(new Error("unrelated")); };
  void unused;
  return Effect.fail(error);
});
