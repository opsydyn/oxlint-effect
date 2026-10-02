# Branching And Local Control Flow: Q45

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
