// Ordinary objects, not Effect APIs: both policies have no import gate.
const Effect = { succeed: (n: number) => n, map: (n: number, f: (n: number) => number) => f(n) };
export const tower = Effect.map(Effect.succeed(1), n => n + 41);
const tools = { pipe: (n: number, f: (n: number) => number) => f(n) };
export const value = tools.pipe(1, n => tools.pipe(n, m => m + 41));
