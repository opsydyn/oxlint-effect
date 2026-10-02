import { Schema as S } from "effect";
const Model = S.Struct({ count: S.Number });
export const decode = S.decodeUnknown(S.parseJson(Model));
