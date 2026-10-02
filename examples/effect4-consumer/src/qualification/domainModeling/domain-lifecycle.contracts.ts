import { Effect, Exit, Schema } from "effect";
import { eligible, LifecycleSchema, transition, Rejected, recover, reject } from "./domain-lifecycle";
if (!eligible({ amount: 42, balance: 42, verified: true })) throw new Error("Valid eligibility changed");
for (const candidate of [{ amount: -1, balance: 42, verified: true }, { amount: 43, balance: 42, verified: true }, { amount: 42, balance: 42, verified: false }]) {
 if (eligible(candidate)) throw new Error("Invalid eligibility accepted");
}
const pending = Schema.decodeUnknownSync(LifecycleSchema)({ _tag: "Pending", userId: "u" });
const approved = transition(pending);
if (approved._tag !== "Approved" || approved.receipt !== "receipt-42" || approved.userId !== "u" || transition(approved) !== approved) throw new Error("Lifecycle transition lost ownership/idempotence");
const rejected = Schema.decodeUnknownSync(LifecycleSchema)({ _tag: "Rejected", userId: "u", reason: "Denied" });
if (transition(rejected) !== rejected) throw new Error("Terminal rejection changed");
if (!Exit.isFailure(await Effect.runPromiseExit(Schema.decodeUnknownEffect(LifecycleSchema)({ approved: true, rejected: true })))) throw new Error("Contradictory flags decoded");
const original = new Error("transport");
const failure = new Rejected({ userId: "u", reason: "Denied", cause: original });
if (await Effect.runPromise(recover(failure)) !== failure || failure.cause !== original || failure.userId !== "u" || failure.reason !== "Denied") throw new Error("Structured recovery lost failure/context");
if (!Exit.isFailure(await Effect.runPromiseExit(reject(failure)))) throw new Error("Structured error became success");
