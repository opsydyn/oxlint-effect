import { Effect } from "effect";
// EXPECT: linteffect/no-node-fs-in-effect-code
// QA: Node filesystem imports should stay behind an explicit platform boundary.
import { readFile } from "node:fs";

// EXPECT: linteffect/no-json-parse-without-schema
// QA: JSON input must be decoded with an Effect Schema at the boundary.
const parsedPayload = JSON.parse("{\"id\": \"user-1\"}");

// EXPECT: linteffect/no-date-now-in-effect
// QA: Effect workflows should obtain time from Clock rather than the wall clock.
const wallClockRead = Effect.sync(() => Date.now());

void readFile;
void parsedPayload;
void wallClockRead;
