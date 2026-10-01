import { Effect } from "effect";
// linteffect/no-manual-service-object-export: arrow-valued literal.
export const ArrowService = { load: () => Effect.succeed(42) };
// linteffect/no-manual-service-object-export: method-valued literal.
export const MethodService = { load() { return Effect.succeed(42); } };
// linteffect/no-manual-service-object-export: direct Effect.fn builder.
export const FnService = { load: Effect.fn(function* () { return 42; }) };
// linteffect/no-manual-service-object-export: suffix policy applies even to pure methods.
export const PureService = { load: () => 42 };
