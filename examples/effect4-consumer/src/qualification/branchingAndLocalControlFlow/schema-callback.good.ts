import { Schema } from "effect";
export const positive = Schema.Number.check(Schema.makeFilter<number>((n) => { return n > 0; }));
