import { Schema } from "effect";
import { acceptUser, UserIdSchema, InvoiceIdSchema, execute, score } from "./domain-vocabulary";
const user = Schema.decodeUnknownSync(UserIdSchema)("user-42");
const invoice = Schema.decodeUnknownSync(InvoiceIdSchema)("invoice-42");
acceptUser(user);
// @ts-expect-error independent brands must not be interchangeable.
acceptUser(invoice);
// @ts-expect-error raw strings must enter through the validated boundary.
acceptUser("user-42");
// @ts-expect-error explicit commands reject boolean flags.
execute(true);
// @ts-expect-error closed status vocabulary rejects unhandled states.
score("pending");
