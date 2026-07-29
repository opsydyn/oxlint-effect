import { Effect, Layer } from "effect";

it("drops the test runtime result", () => {
  Effect.runPromise(Effect.succeed("order"));
});

it("asserts a typed Effect error as a rejection", async () => {
  await expect(
    Effect.runPromise(Effect.fail({ _tag: "OrderNotFound" as const })),
  ).rejects.toMatchObject({ _tag: "OrderNotFound" });
});

const testLayer = Layer.provide(
  OrderService.Default,
  Layer.succeed(FileSystem, testFileSystem),
);

void testLayer;
