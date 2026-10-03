import { Schema } from "effect";
export const State = Schema.Struct({ count: Schema.Number, items: Schema.Record(Schema.String, Schema.Number) });
export type State = typeof State.Type;
export const initial = State.make({ count: 41, items: { answer: 41 } });
