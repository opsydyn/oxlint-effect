import { Data, Effect } from "effect";
export class RequestFailure extends Data.TaggedError("Q52RequestFailure")<{ readonly message: string }> {}
export const original = new RequestFailure({ message: "remote failure" });
export type Envelope = { readonly data: number; readonly errors: readonly RequestFailure[] };
export const success: Envelope = { data: 42, errors: [] };
export const rejected: Envelope = { data: 0, errors: [original] };
// Local typed envelope boundary: not a claim about an external GraphQL client API.
export const wrapGraphqlCall = () => <A, E, R>(task: Effect.Effect<A, E, R>) => task;
export const applyResponse = (response: Envelope): Effect.Effect<number, RequestFailure> => response.errors.length === 0 ? Effect.succeed(response.data) : Effect.fail(response.errors[0]!);
