import { Context } from "effect";
// linteffect/prefer-effect-service: legacy bare service keys.
export class Tagged extends Context.Tag("Tagged")<Tagged, { readonly value: number }>() {}
export const Generic = Context.GenericTag<{ readonly value: number }>("Generic");
