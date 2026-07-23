import { Effect } from "effect";
import { join } from "node:path";

const databaseUrl = process.env.DATABASE_URL;
// oxlint-disable-next-line linteffect/no-run-effect-outside-boundary
const result = Effect.runPromise(Effect.void);

void join;
void databaseUrl;
void result;
