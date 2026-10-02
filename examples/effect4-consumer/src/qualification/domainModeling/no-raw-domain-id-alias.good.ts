export { UserIdSchema, InvoiceIdSchema } from "./domain-vocabulary";
// Existing detector only sees directly primitive aliases ending Id/ID.
import { Schema } from "effect";
type Primitive = string;
export type UserId = Primitive;
export type Lowercaseid = string;
export type OptionalId = string | undefined;
export type BrandedUserId = typeof Schema.String;
