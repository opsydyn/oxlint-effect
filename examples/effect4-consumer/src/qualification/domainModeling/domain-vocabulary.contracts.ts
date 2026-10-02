import { Effect, Exit, Schema } from "effect";
import { acceptUser, UserIdSchema, execute, StatusSchema, score } from "./domain-vocabulary";
const user = Schema.decodeUnknownSync(UserIdSchema)("user-42");
if (acceptUser(user) !== "user-42" || Schema.encodeSync(UserIdSchema)(user) !== "user-42") throw new Error("Brand changed wire identity");
const notified = execute({ _tag: "Notify", userId: user });
const silent = execute({ _tag: "Silent", userId: user });
if (!notified.notified || silent.notified || notified.userId !== user || silent.userId !== user) throw new Error("Commands changed ownership");
if (score(Schema.decodeUnknownSync(StatusSchema)("approved")) !== 42 || score(Schema.decodeUnknownSync(StatusSchema)("rejected")) !== 0) throw new Error("Status mapping changed values");
for (const invalid of ["", 42]) {
 const exit = await Effect.runPromiseExit(Schema.decodeUnknownEffect(UserIdSchema)(invalid));
 if (!Exit.isFailure(exit)) throw new Error("Invalid ID crossed boundary");
}
if (!Exit.isFailure(await Effect.runPromiseExit(Schema.decodeUnknownEffect(StatusSchema)("pending")))) throw new Error("Unknown status crossed boundary");
