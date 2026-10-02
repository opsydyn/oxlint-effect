import { Match } from "effect";
declare const mode: "ready" | "waiting";
// @ts-expect-error Missing waiting branch must not claim exhaustive handling.
Match.value(mode).pipe(Match.when("ready", () => 42), Match.exhaustive);
