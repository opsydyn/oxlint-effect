import { Effect } from "effect";
// linteffect/no-ternary: every ConditionalExpression after import.
export function selected(enabled: boolean) { return enabled ? 42 : 0; }
export function nested(enabled: boolean, allowed: boolean) { return enabled ? (allowed ? 42 : 1) : 0; }
export function task(enabled: boolean) { return Effect.succeed(enabled ? 42 : 0); }
export function unused() { const never = () => true ? 1 : 0; return 42; }
