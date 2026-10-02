# Pipeline Shape And Sequencing: Q41

These are deliberately uncorrected anti-patterns for Effect 4. The packed
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

Current policy includes `flatMapEager`, including mixed eager/lazy ladders. Legacy policy excludes eager-only/mixed controls. Both majors still export `flatten`.

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
