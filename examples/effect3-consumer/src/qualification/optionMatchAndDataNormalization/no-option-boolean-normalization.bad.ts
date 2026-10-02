import { Option } from "effect";
// linteffect/no-option-boolean-normalization: direct match config, exact literal arrows.
export const normalize = (value: Option.Option<unknown>) => Option.match(value, { onNone: () => false, onSome: value => value === true });
export const reversed = (value: Option.Option<unknown>) => Option.match(value, { onNone: () => false, onSome: value => true === value });
