import { Effect } from "effect";

const startup = Effect.sync(() => {
  console.error("starting service");
});

const recovered = Effect.succeed("user").pipe(
  Effect.catchAll(() => Effect.logError("load failed")),
);

export const loadUser = (): Effect.Effect<string, never> => Effect.succeed("user");

void startup;
void recovered;
