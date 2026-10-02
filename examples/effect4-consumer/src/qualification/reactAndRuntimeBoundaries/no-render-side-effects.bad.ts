import { Match } from "effect";
import { createElement } from "react";
// linteffect/no-render-side-effects: Match receiver-pipe ExpressionStatements.
export function View({ events }: { events: string[] }) {
  Match.value(true).pipe(Match.when(true, () => { events.push("render"); }), Match.orElse(() => undefined));
  return createElement("button", null, 42);
}
// Pure and ordinary statements also warn: this is not component/effect analysis.
export function pure() { Match.value(true).pipe(Match.when(true, () => 42), Match.orElse(() => 0)); return 42; }
export function unused() { const never = () => { Match.value(true).pipe(Match.when(true, () => 0), Match.orElse(() => 1)); }; return 42; }
Match.value(true).pipe(Match.when(true, () => 42), Match.orElse(() => 0));
