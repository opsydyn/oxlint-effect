import { Effect } from "effect";
import { applyResponse, original, success, wrapGraphqlCall, type Envelope } from "./envelope";
export const wrapped = Effect.fail(original).pipe(wrapGraphqlCall());
export const response = (value: Envelope) => Effect.succeed(value).pipe(Effect.flatMap(applyResponse));
export const successful = Effect.succeed(success).pipe(wrapGraphqlCall(), Effect.flatMap(applyResponse));
// Data-first/non-pipe/alias controls are gaps, not recommended broad recovery.
export const nonPipe = Effect.catch(wrapGraphqlCall()(Effect.fail(original)), () => Effect.succeed(42));
const wrapper = wrapGraphqlCall;
export const alias = Effect.fail(original).pipe(wrapper(), Effect.catch(() => Effect.succeed(42)));
export const unrelated = Effect.fail(original).pipe(Effect.catch(() => Effect.succeed(42)));
