import { Schema } from "effect";
export const State = Schema.Struct({ count: Schema.Number, items: Schema.Record({ key: Schema.String, value: Schema.Number }) });
export type State = typeof State.Type;
export const initial = State.make({ count: 41, items: { answer: 41 } });
