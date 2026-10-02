import { Schema } from "effect";
import { AdminCommand, readUser } from "./domain-context";
const command = Schema.decodeUnknownSync(AdminCommand)({ userId: "u", access: "Admin" });
readUser(command);
// @ts-expect-error raw ID and context-free command are not accepted.
readUser({ userId: "u" });
// @ts-expect-error explicit context rejects accidental public operation.
readUser({ ...command, access: "Public" });
