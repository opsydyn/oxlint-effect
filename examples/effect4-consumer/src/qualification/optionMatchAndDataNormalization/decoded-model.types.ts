import { Schema, Option } from "effect";
import { Flags } from "./decoded-model";
const flags: typeof Flags.Type = { enabled: false };
void flags;
// @ts-expect-error decoded flags do not accept text booleans.
const text: typeof Flags.Type = { enabled: "false" };
void text;
// @ts-expect-error removed v3 constructor must not be recommended for v4.
Option.fromNullable(null);
