import { DateTime, Duration, Effect, Schema } from "effect";
import { UserIdSchema } from "./domain-vocabulary";
const Amount = Schema.Finite.pipe(Schema.greaterThan(0), Schema.brand("Q31Amount"));
export const CommandSchema = Schema.Struct({ fromAccountId: UserIdSchema, toAccountId: UserIdSchema, amount: Amount });
export type TransferCommand = Schema.Schema.Type<typeof CommandSchema>;
export const decodeCommand = Schema.decodeUnknown(CommandSchema);
export const submit = (command: TransferCommand) => Effect.succeed(command);
const Milliseconds = Schema.Finite.pipe(Schema.greaterThanOrEqualTo(0));
const EpochMilliseconds = Schema.Int.pipe(Schema.between(0, 8640000000000000));
export const WireOptions = Schema.Struct({ createdAt: EpochMilliseconds, timeoutMs: Milliseconds });
export interface DomainOptions { readonly createdAt: DateTime.Utc; readonly timeoutMs: Duration.Duration }
export const decodeOptions = (options: unknown) => Schema.decodeUnknown(WireOptions)(options).pipe(
 Effect.map(wire => ({ createdAt: DateTime.unsafeMake(wire.createdAt), timeoutMs: Duration.millis(wire.timeoutMs) })),
);
export const encodeOptions = (options: DomainOptions) => ({ createdAt: DateTime.toEpochMillis(options.createdAt), timeoutMs: Duration.toMillis(options.timeoutMs) });
