import { DateTime, Effect, Exit, Schema, TestClock, TestContext } from "effect";

import { AdminCommand, readUser, adminLayer, domainTime } from "./domain-context";
const command = Schema.decodeUnknownSync(AdminCommand)({ userId: "u", access: "Admin" });
if (await Effect.runPromise(Effect.provide(readUser(command), adminLayer)) !== command.userId) throw new Error("Context service lost ID");
if (!Exit.isFailure(await Effect.runPromiseExit(Schema.decodeUnknown(AdminCommand)({ userId: "u", access: "Public" })))) throw new Error("Wrong context decoded");
await Effect.runPromise(Effect.provide(Effect.gen(function* () {
 yield* TestClock.setTime(1000);
 const first = yield* domainTime;
 yield* TestClock.adjust("1 second");
 const second = yield* domainTime;
 if (DateTime.toEpochMillis(first) !== 1000 || DateTime.toEpochMillis(second) !== 2000) throw new Error("Clock repair is not deterministic");
}), TestContext.TestContext));
