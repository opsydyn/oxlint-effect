import { Data, Effect, Match, Predicate, Schema } from "effect";
export interface Candidate { readonly balance: number; readonly amount: number; readonly verified: boolean }
const positive = (candidate: Candidate) => candidate.amount > 0;
const funded = (candidate: Candidate) => candidate.balance >= candidate.amount;
const verified = (candidate: Candidate) => candidate.verified;
export const eligible = Predicate.every([positive, funded, verified]);
export const LifecycleSchema = Schema.Union([Schema.TaggedStruct("Pending", { userId: Schema.String }), Schema.TaggedStruct("Approved", { userId: Schema.String, receipt: Schema.String }), Schema.TaggedStruct("Rejected", { userId: Schema.String, reason: Schema.String })]);
export type Lifecycle = typeof LifecycleSchema.Type;
export const transition = (state: Lifecycle) => Match.value(state).pipe(
 Match.tag("Pending", value => ({ _tag: "Approved" as const, userId: value.userId, receipt: "receipt-42" })),
 Match.tag("Approved", value => value),
 Match.tag("Rejected", value => value),
 Match.exhaustive,
);
export class Rejected extends Data.TaggedError("Q32Rejected")<{ readonly userId: string; readonly reason: string; readonly cause: unknown }> {}
export const reject = (error: Rejected) => Effect.fail(error);
export const recover = (error: Rejected) => reject(error).pipe(Effect.catchTag("Q32Rejected", failure => Effect.succeed(failure)));
