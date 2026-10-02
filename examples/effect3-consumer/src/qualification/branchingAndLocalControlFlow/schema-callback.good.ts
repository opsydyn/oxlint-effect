import { Schema } from "effect";
export const positive = Schema.Number.pipe(Schema.filter((n) => { return n > 0; }));
