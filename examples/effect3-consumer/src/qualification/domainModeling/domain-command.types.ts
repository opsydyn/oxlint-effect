import { DateTime, Duration, Schema } from "effect";
import { CommandSchema, submit, type DomainOptions } from "./domain-command";
const command = Schema.decodeUnknownSync(CommandSchema)({ fromAccountId: "a", toAccountId: "b", amount: 42 });
submit(command);
// @ts-expect-error branded amounts require boundary validation.
submit({ ...command, amount: 42 });
// @ts-expect-error raw account IDs are not domain IDs.
submit({ ...command, fromAccountId: "b" });
// @ts-expect-error duration and timestamp are distinct domain values.
const swapped: DomainOptions = { createdAt: Duration.millis(1000), timeoutMs: DateTime.unsafeMake(0) };
void swapped;
