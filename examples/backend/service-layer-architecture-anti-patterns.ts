import { Context, Effect, Layer } from "effect";

declare const id: string;

// EXPECT: linteffect/prefer-effect-service
// QA: application services should use Effect.Service instead of Context.Tag.
const LegacyUserService = Context.Tag("LegacyUserService");

// EXPECT: linteffect/no-layer-provide-in-service-definition
// QA: Effect.Service definitions should not hide layer assembly inside the service body.
class ServiceWithInlineProvide extends Effect.Service<ServiceWithInlineProvide>()(
  "ServiceWithInlineProvide",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      return Layer.provide(Layer.empty, Layer.empty);
    }),
  },
) {}

// EXPECT: linteffect/require-service-accessors
// QA: services should enable generated static accessors for consistent APIs.
class ServiceWithoutAccessors extends Effect.Service<ServiceWithoutAccessors>()(
  "ServiceWithoutAccessors",
  {
    effect: Effect.gen(function* () {
      return {
        load: () => Effect.succeed(id),
      };
    }),
  },
) {}

void LegacyUserService;
void ServiceWithInlineProvide;
void ServiceWithoutAccessors;
