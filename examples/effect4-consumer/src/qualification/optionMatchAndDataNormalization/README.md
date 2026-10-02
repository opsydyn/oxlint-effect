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
