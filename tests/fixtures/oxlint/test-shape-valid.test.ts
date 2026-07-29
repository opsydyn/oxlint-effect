import { Effect, Layer } from "effect";

it("awaits the test runtime result", async () => {
  const order = await Effect.runPromise(Effect.succeed("order"));
  expect(order).toBe("order");
});

it("asserts an expected typed Effect error structurally", async () => {
  const error = await Effect.runPromise(
    Effect.fail({ _tag: "OrderNotFound" as const }).pipe(Effect.flip),
  );

  expect(error._tag).toBe("OrderNotFound");
});

const testLayer = Layer.provide(
  OrderService.Default,
  NodeContext.layer,
);

void testLayer;
