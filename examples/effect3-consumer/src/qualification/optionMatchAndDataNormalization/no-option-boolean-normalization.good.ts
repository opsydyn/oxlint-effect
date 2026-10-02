import { Option } from "effect";
export { decodeFlags, enabled } from "./decoded-model";
// These exact-shape gaps are not boundary normalisation repairs.
export const dataLast = (value: Option.Option<unknown>) => value.pipe(Option.match({ onNone: () => false, onSome: value => value === true }));
export const blocks = (value: Option.Option<unknown>) => Option.match(value, { onNone: () => { return false; }, onSome: value => { return value === true; } });
const onNone = () => false;
const onSome = (value: unknown) => value === true;
export const named = (value: Option.Option<unknown>) => Option.match(value, { onNone, onSome });
