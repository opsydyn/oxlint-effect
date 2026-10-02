const Effect = { sync: (thunk: () => number) => thunk };
export const unrelated = Effect.sync(() => Date.now());
