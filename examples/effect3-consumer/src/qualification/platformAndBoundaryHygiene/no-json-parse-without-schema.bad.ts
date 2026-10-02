import { Effect } from "effect";
export const raw = (text: string) => {
  // @lint-expect linteffect/no-json-parse-without-schema
  return JSON.parse(text);
};
export const sync = (text: string) => Effect.sync(() => {
  // @lint-expect linteffect/no-json-parse-without-schema
  return JSON.parse(text);
});
export const workflow = (text: string) => Effect.gen(function* () {
  // @lint-expect linteffect/no-json-parse-without-schema
  return JSON.parse(text);
});
export const asyncRead = async (text: string) => {
  // @lint-expect linteffect/no-json-parse-without-schema
  return JSON.parse(text);
};
