import { Context, Effect, Layer } from "effect";
// EXPECT: linteffect/no-namespace-effect-import
// QA: namespace imports hide the preferred direct Effect package import shape.
import * as EffectNamespace from "effect";

declare const DatabaseService: any;
declare const id: string;

// EXPECT: linteffect/prefer-effect-service
// QA: application services should use Effect.Service instead of Context.Tag.
const LegacyUserService = Context.Tag("LegacyUserService");

// EXPECT: linteffect/no-manual-service-object-export
// QA: exported service-shaped objects should become Effect.Service classes.
export const ManualUserService = {
  load: () => Effect.succeed(id),
};

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

// EXPECT: linteffect/require-service-dependencies
// QA: services that yield other services should declare their Default layers.
class ServiceWithoutDependencies extends Effect.Service<ServiceWithoutDependencies>()(
  "ServiceWithoutDependencies",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const database = yield* DatabaseService;
      return {
        load: () => database.load(id),
      };
    }),
  },
) {}

// EXPECT: linteffect/no-layer-merge-in-request-handler
// QA: request handlers should use the application layer, not assemble one.
function userRouteHandler() {
  return Layer.mergeAll(Layer.empty, Layer.empty);
}

// EXPECT: linteffect/no-service-method-returning-promise
// QA: service methods should return Effect so cancellation and failures stay typed.
class ServiceMethodReturningPromise extends Effect.Service<ServiceMethodReturningPromise>()(
  "ServiceMethodReturningPromise",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      return {
        load: (): Promise<string> => Promise.resolve(id),
      };
    }),
  },
) {}

// GAP REVIEW:
// Later slices should add EXPECT examples for nested Layer.provide, inline
// Effect.provide in programs, long Layer.merge chains, and scattered service
// layer composition.

void EffectNamespace;
void LegacyUserService;
void ManualUserService;
void ServiceWithInlineProvide;
void ServiceWithoutAccessors;
void ServiceWithoutDependencies;
void userRouteHandler;
void ServiceMethodReturningPromise;
