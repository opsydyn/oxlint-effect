# Option, Match And Normalisation Qualification

Q34 checks `no-option-as`, `no-match-void-branch` and `no-match-effect-branch`
against both pinned majors. Option.as remains supported in both majors: it
preserves None and replaces Some. The style repair uses Option.map explicitly;
runtime tests preserve presence and 42, including dual invocation forms.

Void detection only sees literal boolean when branches and immediate arrow
Effect.void bodies, or immediate orElse. Block/function/alias shapes can be clean
without changing the no-op. Pure selection retains undefined/42 exactly; removing
or changing a no-op requires an explicit behavioural decision.

Effect-branch policy recognises Match.value().pipe and Option.match with literal
Effect sequencing calls. Leaf Effects are allowed; named callbacks, aliases and
gen-only sequencing remain opaque. A simple Effect.map is still reported even
when not a multi-step workflow. Unlike the other two owners, this rule has no
Effect import gate. Fixtures use actual selected APIs, not detector names as
runtime proof. Current andThen requires an Effect/callback; legacy accepts a
plain constant, with compiler controls capturing the difference.

Working repairs select the complete branch-specific value before a common
pipeline. Both true/false and Some/None paths retain 42/0; failures retain their
original reference. `unsafeCommon` is a labelled clean counterexample: blindly
moving +41 outside the branch changes false to 41. No clean diagnostic alone
establishes equivalence. Packed lint, types and runtime contracts are the QA gate.

## Q35 Decoded Models And Nullish Sources

`no-model-overlay-cast` reports non-const variable initializer assertions, even
unrelated primitive casts; multiple asserted declarators yield one report.
`satisfies` is clean. Current policy exempts actual parsed `as const`; legacy
retains its conservative parser-shape false positive. Assertions only in returned
expressions are a gap. The bad overlay retains a string in a nominal number field at runtime;
correct Schema decoding validates rather than trusting the assertion.

`no-unknown-boolean-coercion-helper` correlates an exact typeof-boolean check
with an immediate Match.orElse-null marker anywhere in the file. Checks before
or after that marker warn once, including unrelated checks outside services.
Reversed/loose/inequality checks and block markers are clean gaps, not validation.
The Schema repair preserves absent/undefined/false/true and rejects text, null
and numeric booleans. Current optional permits absence and explicit undefined;
optionalKey is stricter and has a separate failing undefined runtime control.

`no-fromnullable-nullish-coalesce` keeps its public ID but selects the installed
major: legacy fromNullable, current fromNullishOr. Both null and undefined wraps
are redundant for these full-nullish converters. Pass the source directly;
runtime checks preserve None and falsy Some(false/0/empty string), not merely 42.
Aliases and stored normalisation remain opaque. Foreign-policy fixture syntax
produces zero reports, and a compiler-negative current fixture rejects removed
fromNullable. No rule rename or legacy diagnostic change is introduced.

## Q36 Booleans And Domain Outcomes

`no-option-boolean-normalization` checks exact data-first Option.match arrow
configurations with false absence and value===true. Reversed true comparison is
also reported; data-last, block and named callbacks remain clean gaps. Runtime
Schema repair retains valid missing/false/true behaviour but rejects malformed
values instead of silently coercing them to false.

Both string-sentinel owners have no import gate and are deliberately broad:
every direct string Effect.succeed or variable literal warns, including empty
strings and legitimate display text. Multiple literal declarators report once.
Stored/template returns and aggregate/const-asserted/enum initialisers are clean
gaps, not proof of domain outcomes. Current guidance uses Result; legacy retains
Either wording. Real Option, tagged state and Result/Either controls preserve
absence, 42 and original tagged failure identity/context. Current compiler checks
reject removed Either. All nine owners now have behavioural evidence, but the
package-size and whole-campaign gates remain outstanding.
