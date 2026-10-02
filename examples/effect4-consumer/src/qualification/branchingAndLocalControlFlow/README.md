# Branching And Local Control Flow: Q45-Q46

These deliberately failing examples use pinned Effect 4. Exact warnings are
checked against the packed plugin, not an editor restart or an application run.

| Rule | Failure | Repair |
| --- | --- | --- |
| `no-if-statement` | [Import-wide if/else-if/nested/unused decisions](no-if-statement.bad.ts) | Match boolean/number/object selection |
| `no-switch-statement` | [Literal union, fall-through and unused switches](no-switch-statement.bad.ts) | Exhaustive Match or explicit default |
| `no-ternary` | [Nested/Effect/unused conditional expressions](no-ternary.bad.ts) | Match/Option/Result selection |

[Repairs](branching.good.ts) use actual Match, Option and Result APIs
and one outer Effect boundary. Legacy advice retains Either.match; current
advice selects Result.match. Detection stays unchanged. Compiler controls in
[branching.types.ts](branching.types.ts) reject incomplete exhaustive matching.

The import gate is file-wide and order-sensitive: even unrelated pure functions
and unused callbacks warn after an ecosystem import. It does not infer actual
Effect logic or whether a decision is desirable. [No-import](branching-no-import.good.ts)
and [late-import](branching-late-import.good.ts) files document that scope, not
endorsed ways to hide warnings.

[Runtime contracts](branching.contracts.ts) compare success/default/false,
else-if, nested and fall-through results with the originals. The nested if and
ternary deliberately differ (0 versus 1 when enabled but not allowed); each
repair preserves its own original. Option absence and own-major result error
identity are retained. No platform/application or semantic branching-safety
claim follows from these syntax checks. Final qualification remains open while
the 30 KB size gate fails.

## Exceptions And IIFEs

[`no-try-catch` failures](no-try-catch.bad.ts) include ordinary adapters,
nested try, finally and unused callbacks. Unlike the branching rules, it has
no import gate: [no-import try](try-no-import.bad.ts) still warns. The owner
reports every TryStatement, not only Effect callback logic.

[`no-arrow-ladder` failures](no-arrow-ladder.bad.ts) cover nested arrow IIFEs,
depth-three multiple reports, unused bodies and first nested candidate only.
[Shape controls](arrow-shape.good.ts) show that mixed FunctionExpression IIFEs
and ordinary nested arrows are not arrow ladders. They may still fail the
separate general IIFE rule.

[`no-iife-wrapper` failures](no-iife-wrapper.bad.ts) include direct arrow,
regular, async, generator and Effect-returning invocations. Named calls and
member `.call` are not direct inline invocations. Both IIFE owners have
[no-import](iife-no-import.good.ts) and [late-import](iife-late-import.good.ts)
scope gaps, not endorsed bypasses.

[Working repairs](wrappers.good.ts) use explicit values/named transformations,
actual Effect.try/match adapters and ensuring cleanup. Real asynchronous work
stays deferred with tryPromise; do not move it to eager construction to hide a
warning. [Runtime contracts](exception-iife.contracts.ts) retain 42, original
error identity, cleanup once on success/failure, async/generator behaviour,
member-call receiver context and a single deferred Promise invocation. This is
not proof that all arbitrary IIFEs can be mechanically inlined without semantic
changes or that callback cancellation has been qualified.
