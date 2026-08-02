import { Effect } from "effect";

declare const connectClient: () => { close: () => void };

export const unownedClient = Effect.gen(function* () {
  const client = connectClient();
  return client;
});

export const deeplyNestedResources = Effect.acquireRelease(
  Effect.acquireRelease(
    Effect.acquireRelease(
      Effect.succeed("resource"),
      () => Effect.void,
    ),
    () => Effect.void,
  ),
  () => Effect.void,
);
