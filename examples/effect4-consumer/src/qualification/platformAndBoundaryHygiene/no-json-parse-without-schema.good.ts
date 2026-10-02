import { Schema } from "effect";
export const Model = Schema.Struct({ count: Schema.Number });
export const decode = Schema.decodeUnknownEffect(Schema.fromJsonString(Model));
// An import suppresses the rule, even without decoding. This is not a validation repair.
export const markerOnly = (text: string) => JSON.parse(text);
