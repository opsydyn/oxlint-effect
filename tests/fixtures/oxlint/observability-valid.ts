import { Effect } from "effect";

const startup = Effect.logInfo("starting service");

const recovered = Effect.succeed("user").pipe(
  Effect.catchAll((error) => Effect.logError("load failed", error)),
);

export const loadUser = (): Effect.Effect<string, never> => Effect.withSpan(
  Effect.succeed("user"),
  "user.load",
);

void startup;
void recovered;
