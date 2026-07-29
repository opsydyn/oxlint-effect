import { Effect, Layer } from "effect";

declare const FileSystem: unknown;
declare const OrderService: { readonly Default: unknown };
declare const testFileSystem: unknown;

// EXPECT: linteffect/no-runpromise-in-non-async-test-body
// QA: Tests must await or return runtime execution so failures and completion are observed.
it("drops Effect runtime completion", () => {
  Effect.runPromise(Effect.succeed("order"));
});

// EXPECT: linteffect/require-effect-flip-for-error-test
// QA: Expected typed failures should be flipped into error values for structural assertions.
it("asserts a typed Effect error as a rejection", async () => {
  await expect(
    Effect.runPromise(Effect.fail({ _tag: "OrderNotFound" as const })),
  ).rejects.toMatchObject({ _tag: "OrderNotFound" });
});

// EXPECT: linteffect/no-test-mock-layer-when-default-available
// QA: A test should not mix a service Default layer with a sibling manual replacement layer.
const testLayer = Layer.provide(
  OrderService.Default,
  Layer.succeed(FileSystem, testFileSystem),
);

void testLayer;
