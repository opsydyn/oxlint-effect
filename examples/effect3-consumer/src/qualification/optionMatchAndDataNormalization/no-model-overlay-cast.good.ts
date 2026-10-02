import { Schema } from "effect";
export { decodeFlags } from "./decoded-model";
export const inferred = Schema.decodeUnknownSync(Schema.Struct({ count: Schema.Number }))({ count: 42 });
export const checked = { count: 42 } satisfies { readonly count: number };
// Return assertions are a detector gap, not decoding proof.
export const opaque = (input: unknown) => input as { readonly count: number };
