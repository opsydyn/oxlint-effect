import { Option } from "effect";
// linteffect/no-option-as: both dual invocation forms, even creating a mapper.
export const direct = Option.as(Option.some(1), 42);
export const pipe = Option.some(1).pipe(Option.as(42));
export const mapper = Option.as(42);
export const absent = Option.as(Option.none<number>(), 42);
