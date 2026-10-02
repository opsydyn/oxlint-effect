// Ordinary same-name object: deliberate no-import false positive.
const Effect = { succeed: (n: number) => n, map: (n: number, f: (n: number) => number) => f(n) };
export const nameOnly = Effect.map(Effect.map(Effect.succeed(1), n => n + 40), n => n + 1);
