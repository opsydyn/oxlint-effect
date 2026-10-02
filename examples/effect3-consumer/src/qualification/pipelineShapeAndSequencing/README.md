# Pipeline Shape And Sequencing: Q41-Q43

These are deliberately uncorrected anti-patterns for Effect 3. The packed
consumer installs the built plugin and checks exact warnings per file. Behavioural
evidence is not release qualification while the 30 KB package-size gate fails.

| Rule | Failure | Working repair |
| --- | --- | --- |
| `no-nested-effect-call` | Three first-argument Effect constructors; depth four reports twice | Generator or named intermediate Effects |
| `no-effect-ladder` | Deep initialisers and explicit returns; both declarators visited | Generator or named intermediate Effects |
| `no-flatmap-ladder` | Nested input/callback flatMap and map+flatten | Generator sequencing |

See [deep failures](deep-effect.bad.ts), [deep repairs](deep-effect.good.ts),
[flatMap failures](no-flatmap-ladder.bad.ts), [flatMap repairs](no-flatmap-ladder.good.ts)
and [runtime contracts](ladder.contracts.ts). Compiler-negative controls live in
[ladder.types.ts](ladder.types.ts), not the executable examples.

Legacy policy preserves the original flatMap and map+flatten detection and exact messages. Current `flatMapEager` is unavailable in this major.

Limits are intentional evidence, not endorsed repairs: computed receivers and
namespace aliases bypass the deep-call rules. `no-effect-ladder` only owns
variable initialisers and explicit returns, unlike the CallExpression owner.
`no-flatmap-ladder` searches callback bodies broadly (even unused callbacks),
but data-last pipe, aliases and concise arrow bodies escape its initialiser/
return shape. The [ordinary same-name object](same-name.bad.ts) demonstrates
that the deep rules have no import gate and can warn outside Effect code.

The runtime compares successful value 42, first/second/third sequencing and
original typed failure identity with later work skipped. Eager success controls
are executed in the current consumer. This is syntax/API qualification, not a
whole-program purity, platform or application execution claim.

## Nested Pipes And Call Towers

[`no-pipe-ladder` failures](no-pipe-ladder.bad.ts) cover free/receiver calls,
depth-three multiple reports and unused nested callbacks. The detector searches
argument trees, not the receiver expression, and has no import gate.
[`no-call-tower` failures](no-call-tower.bad.ts) cover unary and first/second
arguments, both direct arguments (one report) and deeper multiple reports.
Callbacks and third arguments are not direct candidates. Ordinary receiver-name
false positives are in [ordinary-towers.bad.ts](ordinary-towers.bad.ts).

Working [pipe](no-pipe-ladder.good.ts) and [tower](no-call-tower.good.ts) repairs
use flat pipelines or generators; aliases/computed calls are labelled gaps,
not endorsed repairs. [Runtime contracts](pipe-tower.contracts.ts) retain 42,
the deliberate void result, source failure identity and terminal fallback order.

## Wrapper Intent And Deferred Execution

[`no-effect-wrapper-alias` failures](no-effect-wrapper-alias.bad.ts) cover
free/receiver pipes, concise factories, returns, unused nested returns and
multiple declarators. [Repairs](no-effect-wrapper-alias.good.ts) compute pure
domain data and construct Effect at the call site. Direct constructors are
allowed; block-arrow/namespace aliases remain documented shape gaps.

[`warn-effect-sync-wrapper` failures](warn-effect-sync-wrapper.bad.ts) use
immediate expression-arrow calls. Even pure callees warn: called-body purity
is not established. [Controls](warn-effect-sync-wrapper.good.ts) cover block,
literal, named, function-expression and console callbacks, while
[late imports](sync-late-import.good.ts) show the existing import-order gap.
Keep real side effects deferred; do not move them into eager succeed arguments
just to silence a warning. Block-body repairs are a syntax-policy control, not
a claim that arbitrary callback work is now safe or pure.

[`no-effect-side-effect-wrapper` failures](no-effect-side-effect-wrapper.bad.ts)
cover actual log/console plus local state/invalidate/Atom name heuristics and
unused callback false positives. Current sequencing uses `andThen`, legacy
`zipRight`; `as` is common. Opposite-policy counts exclude the foreign
sequencing form. [Generator repairs](no-effect-side-effect-wrapper.good.ts)
keep effects explicit and return the real value; named opaque steps are gaps.
The rule has no import gate. Local Atom/state helpers are not platform API proof.

[Runtime contracts](wrappers.contracts.ts) check 42, no execution during
construction, two runs giving two calls, once-only state/invalidate/Atom and
console work, and identical thrown defect identity. Console is restored in a
finally block. Actual logs execute under each pinned major. No application is
started. 

## Terminal Recovery

[`no-effect-orElse-ladder` failures](no-effect-orElse-ladder.bad.ts) cover all four legacy sequencing tokens, unused callbacks and real recovery.
The [repair](terminal-recovery.good.ts) separates generator sequencing from
terminal `orElse` recovery. Successful/failing paths both retain 42;
failure skips the second step and invokes fallback once. Recovery intentionally
consumes the error; the source error identity is checked before recovery.
Stored first arguments are opaque to the legacy syntax search. Current policy is explicitly tested as a no-op on these legacy failures.
