import { Schema } from "effect";
// @ts-expect-error Legacy filter factory is removed.
Schema.filter((n: number) => n > 0);
