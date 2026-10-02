import { DateTime, Duration, Effect, Schema } from "effect";
import { UserIdSchema } from "./domain-vocabulary";
const Amount = Schema.Finite.check(Schema.isGreaterThan(0)).pipe(Schema.brand("Q31Amount"));
export const CommandSchema = Schema.Struct({ fromAccountId: UserIdSchema, toAccountId: UserIdSchema, amount: Amount });
export type TransferCommand = typeof CommandSchema.Type;
export const decodeCommand = Schema.decodeUnknownEffect(CommandSchema);
export const submit = (command: TransferCommand) => Effect.succeed(command);
const Milliseconds = Schema.Finite.check(Schema.isGreaterThanOrEqualTo(0));
const EpochMilliseconds = Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 8640000000000000 }));
export const WireOptions = Schema.Struct({ createdAt: EpochMilliseconds, timeoutMs: Milliseconds });
export interface DomainOptions { readonly createdAt: DateTime.Utc; readonly timeoutMs: Duration.Duration }
export const decodeOptions = (options: unknown) => Schema.decodeUnknownEffect(WireOptions)(options).pipe(
 Effect.map(wire => ({ createdAt: DateTime.makeUnsafe(wire.createdAt), timeoutMs: Duration.millis(wire.timeoutMs) })),
);
export const encodeOptions = (options: DomainOptions) => ({ createdAt: DateTime.toEpochMillis(options.createdAt), timeoutMs: Duration.toMillis(options.timeoutMs) });
