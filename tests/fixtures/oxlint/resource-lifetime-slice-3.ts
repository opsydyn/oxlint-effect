import { Effect } from "effect";

declare const connectClient: () => unknown;

const globalPool = new DatabasePool();

export function requestHandler() {
  const requestClient = connectClient();
  return requestClient;
}

export function runWithOpenResource() {
  const openClient = connectClient();
  return Effect.runPromise(Effect.succeed(openClient));
}

declare class DatabasePool {}

void globalPool;
