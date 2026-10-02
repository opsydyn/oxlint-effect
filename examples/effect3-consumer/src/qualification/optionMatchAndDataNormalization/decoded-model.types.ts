import { Schema, Option } from "effect";
import { Flags } from "./decoded-model";
const flags: Schema.Schema.Type<typeof Flags> = { enabled: false };
void flags;
// @ts-expect-error decoded flags do not accept text booleans.
const text: Schema.Schema.Type<typeof Flags> = { enabled: "false" };
void text;
Option.fromNullable(null);
