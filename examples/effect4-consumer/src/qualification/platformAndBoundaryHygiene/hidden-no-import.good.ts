const Effect = { runSync: (value: number) => value };
export const unrelated = Effect.runSync(42);
