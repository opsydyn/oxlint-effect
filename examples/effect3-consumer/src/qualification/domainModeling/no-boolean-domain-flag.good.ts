import { Effect } from "effect";
export { execute } from "./domain-vocabulary";
// Clean controls, not behavioural repairs: aliases/defaults/destructuring are opaque.
type Flag = boolean;
export const alias = (shouldNotify: Flag) => shouldNotify;
export const defaulted = (shouldNotify = true) => shouldNotify;
export const destructured = ({ shouldNotify }: { shouldNotify: boolean }) => shouldNotify;
export const neutral = (enabled: boolean) => Effect.succeed(enabled);
