import { Effect, Match, pipe } from "effect";
import { Match as M } from "effect";
import { createElement } from "react";
export function View() {
  const value = Match.value(true).pipe(Match.when(true, () => 42), Match.orElse(() => 0));
  return createElement("button", null, value);
}
export const action = (events: string[]) => Effect.sync(() => { events.push("action"); return 42; });
// Receiver/free/alias shape limits, not purity or render-safety proof.
export function free() { pipe(Match.value(true), Match.when(true, () => 42), Match.orElse(() => 0)); return 42; }
export function alias() { M.value(true).pipe(M.when(true, () => 42), M.orElse(() => 0)); return 42; }
export function computed() { Match["value"](true).pipe(Match.when(true, () => 42), Match.orElse(() => 0)); return 42; }
