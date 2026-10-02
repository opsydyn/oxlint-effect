// Removed foreign shape, expressed as a local ordinary object; not a v4 API claim.
const Effect = {
  succeed: (n: number) => n,
  flatMap: (n: number, f: (n: number) => number) => f(n),
  orElse: (n: number, _fallback: () => number) => n,
};
export const foreign = Effect.orElse(Effect.flatMap(Effect.succeed(1), n => n + 41), () => 42);
