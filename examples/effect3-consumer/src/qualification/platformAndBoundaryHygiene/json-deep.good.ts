import * as S from "effect/Schema";
const Model = S.Struct({ count: S.Number });
export const decode = S.decodeUnknown(S.parseJson(Model));
