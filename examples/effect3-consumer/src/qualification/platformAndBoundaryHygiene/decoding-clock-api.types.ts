import { Effect, Schema } from "effect";
const Model = Schema.Struct({ count: Schema.Number });
const decode = Schema.decodeUnknown(Schema.parseJson(Model));
const checked: Effect.Effect<{ readonly count: number }, unknown> = decode('{"count":42}');
void checked;
// @ts-expect-error Current decodeUnknownEffect is absent.
Schema.decodeUnknownEffect(Model);
// @ts-expect-error Current fromJsonString is absent.
Schema.fromJsonString(Model);
