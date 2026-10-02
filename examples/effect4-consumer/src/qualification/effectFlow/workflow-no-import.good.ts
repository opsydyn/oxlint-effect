// An ordinary receiver called Effect is not evidence of ecosystem logic.
export const Effect = { succeed: (value: number) => value };
export const value = Effect.succeed(42);
