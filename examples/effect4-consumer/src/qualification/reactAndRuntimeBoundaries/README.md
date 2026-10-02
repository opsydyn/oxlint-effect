# React And Runtime Boundaries: Q49-Q50

Pinned Effect 4, React/React DOM 19.2.7 and their types make these actual
typed fixtures. Exact warnings are checked from the packed plugin. No browser
application or dev server is started.

## React State Ownership

[`no-react-state` failures](no-react-state.bad.ts) demonstrate all six hook
names as bare and member calls: useState, useReducer, useContext, useCallback,
useEffect and useSyncExternalStore. This is a policy over names, not a judgment
that each valid React hook is unsafe. It has no import/receiver-ownership gate:
[ordinary methods](ordinary-hooks.bad.ts) can warn.

[The repair](react-state.good.ts) receives externally owned state as props;
actual Effect Ref owns the state read. Aliased/computed hooks are labelled gaps,
not recommended bypasses. Current advice no longer prescribes the repository's legacy-only @effect-atom/atom-react version; it describes explicit props or a compatible reactive adapter without claiming unqualified adapter support.

[Runtime contracts](react-runtime.contracts.ts) compare real server-rendered
markup (`<span>42</span>`), typed props and alias/computed controls. Server effects
must not run. This is SSR qualification, not client subscriptions, hydration,
effect cleanup, browser interaction or visual acceptance.

## Fork Execution

`no-runtime-runfork` is legacy-only: current Runtime has no runFork export and current presets exclude the stable ID. [Compiler controls](runtime.types.ts) prove its absence. [Foreign local shapes](foreign-runtime.good.ts) are only ordinary-object policy controls: explicit legacy warns, current is a no-op. Actual runForkWith and joining are exercised separately; exclusion is not an endorsement of detached ownership.

## Typed Failures And Defects

[`no-or-die-outside-boundary` failures](no-or-die-outside-boundary.bad.ts) cover
direct, receiver and free-pipe orDie. Legacy also covers direct/curried orDieWith;
current ignores the removed export. Factory and enclosing pipe can both report.
[Typed repair](typed-failure.good.ts) retains a recoverable error instead of
converting it into a defect. Runtime checks defect identity and typed failure
identity separately; this intentionally changes the error channel, not merely
the expression shape.

Historical policy is path-unaware: [main.ts](main.ts) still warns. It does not
accept boundaryPaths or automatically share no-run-effect-outside-boundary's
path exemptions. For an explicitly owned conversion, configure an Oxlint
override setting this rule off for that boundary file; the packed harness
checks that override. [Late import](or-die-late-import.good.ts), aliases and
ordinary same-name receivers document existing limits.

## Loading, Render Statements And Provision

[`prevent-dynamic-imports` failures](prevent-dynamic-imports.bad.ts) include
literal, awaited, template and variable imports with no Effect gate.
[Static repair](static-loading.good.ts) retains the real module value; type-only
import syntax is not a runtime ImportExpression. Runtime imports only the known
local fixture, never an untrusted external path.

[`no-render-side-effects` failures](no-render-side-effects.bad.ts) include a
real React view plus ordinary pure, unused and top-level Match statements.
The owner does not resolve component scope or actual purity. Free/alias/computed
Match and late imports are gaps; assigned pure selection is a working view
repair. [Owned action](render-action.good.ts) defers mutation to an explicit
Effect action. Two SSR renders retain identical button markup; the bad view
mutates twice, the repaired view does not, and one later action mutates once.
This intentionally changes effect timing; it is not client event qualification.

[`no-inline-runtime-provide` failures](no-inline-runtime-provide.bad.ts) cover
receiver/free/yielded/multiple/empty provision. First provide only per pipe;
even valid exported-boundary pipes warn. Actual own-major
[service/Layer](runtime-service.ts) and [direct boundary](runtime-boundary.good.ts)
repair retain 42 and original failure. The rule does not infer actual local
helper ownership. Curried/alias/late-import shapes are labelled gaps.
Advice uses Context.Service for this major.

[Runtime contracts](loading-render-provision.contracts.ts) cover module values,
SSR/action timing, real service wiring and typed failure identity. This completes
this group's owners' behavioural evidence, not final qualification.

Final qualification remains open while the unchanged 30 KB size gate fails.
