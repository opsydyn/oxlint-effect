import { Schema } from "effect";
export const Flags = Schema.Struct({ enabled: Schema.optional(Schema.Boolean) });
export type Flags = Schema.Schema.Type<typeof Flags>;
export const decodeFlags = Schema.decodeUnknown(Flags);
export const enabled = (flags: Flags) => flags.enabled === true;
