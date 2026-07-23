import { Effect } from "effect";

// EXPECT: linteffect/no-node-platform-in-shared-code
// QA: Shared code must not import Node-only modules directly.
import { join } from "node:path";

// EXPECT: linteffect/no-node-fs-in-effect-code
// QA: Node filesystem imports should stay behind an explicit platform boundary.
import { readFile } from "node:fs";

// EXPECT: linteffect/no-process-env-direct-read
// QA: Environment values belong in a decoded configuration service or Layer.
const databaseUrl = process.env.DATABASE_URL;

// EXPECT: linteffect/no-json-parse-without-schema
// QA: JSON input must be decoded with an Effect Schema at the boundary.
const parsedPayload = JSON.parse("{\"id\": \"user-1\"}");

// EXPECT: linteffect/no-date-now-in-effect
// QA: Effect workflows should obtain time from Clock rather than the wall clock.
const wallClockRead = Effect.sync(() => Date.now());

// EXPECT: linteffect/no-hidden-effect-execution
// QA: Runtime execution stays at configured application boundaries.
const result = Effect.runPromise(Effect.succeed("started"));

void join;
void readFile;
void databaseUrl;
void parsedPayload;
void wallClockRead;
void result;
