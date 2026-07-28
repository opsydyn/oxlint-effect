import { Effect } from "effect";

const startedAt = new Date();

try {
  const startup = Effect.tryPromise(() => Promise.resolve("started"));
  void Effect.runPromise(startup);
} catch (error) {
  console.error(error);
}

void startedAt;
