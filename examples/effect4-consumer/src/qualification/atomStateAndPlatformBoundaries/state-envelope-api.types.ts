import { Effect, Schema } from "effect";
// @ts-expect-error Legacy catchAll is absent from current Effect.
Effect.catchAll;
// @ts-expect-error Current Schema.make constructs from an AST, not from a schema value.
Schema.make(Schema.Number)(42);
