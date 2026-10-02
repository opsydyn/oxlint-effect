import { Clock, Context, DateTime, Effect, Layer, Schema } from "effect";
import { UserIdSchema, type UserId } from "./domain-vocabulary";
export const AdminCommand = Schema.Struct({ userId: UserIdSchema, access: Schema.Literal("Admin") });
export type Command = Schema.Schema.Type<typeof AdminCommand>;
interface Reader { readonly load: (command: Command) => Effect.Effect<UserId> }
export class AdminReader extends Context.Tag("Q33AdminReader")<AdminReader, Reader>() {}
export const adminLayer = Layer.succeed(AdminReader, { load: (command: Command) => Effect.succeed(command.userId) });
export const readUser = (command: Command) => Effect.gen(function* () { const reader = yield* AdminReader; return yield* reader.load(command); });
export const domainTime = Clock.currentTimeMillis.pipe(Effect.map(time => DateTime.unsafeMake(time)));
