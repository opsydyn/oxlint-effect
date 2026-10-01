// linteffect/no-namespace-effect-import: root and supported subpath namespaces.
import * as Core from "effect";
import * as Programs from "effect/Effect";
import * as Functions from "effect/Function";
export const program = Core.Effect.map(Programs.succeed(42), Functions.identity);
