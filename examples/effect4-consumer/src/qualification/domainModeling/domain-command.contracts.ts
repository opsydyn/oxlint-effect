import { Duration, Effect, Exit, Schema } from "effect";
import { CommandSchema, decodeCommand, submit, decodeOptions, encodeOptions } from "./domain-command";
const command = await Effect.runPromise(decodeCommand({ fromAccountId: "a", toAccountId: "b", amount: 42 }));
if (await Effect.runPromise(submit(command)) !== command) throw new Error("Named command lost identity");
const wire = Schema.encodeSync(CommandSchema)(command);
if (wire.fromAccountId !== "a" || wire.toAccountId !== "b" || wire.amount !== 42) throw new Error("Command wire values changed");
const options = await Effect.runPromise(decodeOptions({ createdAt: 1700000000000, timeoutMs: 1500 }));
const encoded = encodeOptions(options);
if (encoded.createdAt !== 1700000000000 || encoded.timeoutMs !== 1500 || Duration.toMillis(Duration.seconds(1.5)) !== encoded.timeoutMs) throw new Error("Milliseconds changed units");
for (const invalid of [{ fromAccountId: "", toAccountId: "b", amount: 42 }, { fromAccountId: "a", toAccountId: "b", amount: -1 }, { fromAccountId: "a", toAccountId: "b", amount: Infinity }]) {
 if (!Exit.isFailure(await Effect.runPromiseExit(decodeCommand(invalid)))) throw new Error("Invalid command crossed boundary");
}
for (const invalid of [{ createdAt: 0 }, { createdAt: 0, timeoutMs: -1 }, { createdAt: 0, timeoutMs: "1500" }, { createdAt: Infinity, timeoutMs: 1500 }, { createdAt: 1e30, timeoutMs: 1500 }, { createdAt: 0.5, timeoutMs: 1500 }]) {
 if (!Exit.isFailure(await Effect.runPromiseExit(decodeOptions(invalid)))) throw new Error("Invalid options crossed boundary");
}
