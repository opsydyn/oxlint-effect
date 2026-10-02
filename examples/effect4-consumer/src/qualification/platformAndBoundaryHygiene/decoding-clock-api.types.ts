import { Effect, Schema } from "effect";
const Model = Schema.Struct({ count: Schema.Number });
const decode = Schema.decodeUnknownEffect(Schema.fromJsonString(Model));
const checked: Effect.Effect<{ readonly count: number }, unknown> = decode('{"count":42}');
void checked;
// @ts-expect-error Legacy decodeUnknown is not the v4 Effect decoder.
Schema.decodeUnknown(Model);
// @ts-expect-error Legacy parseJson schema constructor is absent.
Schema.parseJson(Model);
