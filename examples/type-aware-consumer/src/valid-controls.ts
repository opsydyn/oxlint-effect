import { Effect } from "effect";

const loadValue = async (): Promise<number> => 1;

export const awaited = async () => await loadValue();
export const effect = Effect.succeed(1);
