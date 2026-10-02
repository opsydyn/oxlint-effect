import { Schema } from "effect";
export const Flags = Schema.Struct({ enabled: Schema.optional(Schema.Boolean) });
export const ExactFlags = Schema.Struct({ enabled: Schema.optionalKey(Schema.Boolean) });
export type Flags = typeof Flags.Type;
export const decodeFlags = Schema.decodeUnknownEffect(Flags);
export const enabled = (flags: Flags) => flags.enabled === true;
