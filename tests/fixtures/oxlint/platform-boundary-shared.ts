import { Effect } from "effect";
import { join } from "node:path";

const environment = process.env;
// oxlint-disable-next-line linteffect/no-run-effect-outside-boundary
const result = Effect.runPromise(Effect.void);

void join;
void environment;
void result;
