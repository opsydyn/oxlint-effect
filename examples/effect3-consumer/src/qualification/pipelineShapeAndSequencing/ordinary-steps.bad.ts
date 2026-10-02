// Local heuristics only, not Atom/Reactivity platform integration proof.
const Atom = { set: () => 42 }, Reactivity = { invalidate: () => 42 };
const Effect = { all: (xs: number[], _options: { concurrency: number }) => xs };
export const atom = Effect.all([Atom.set()], { concurrency: 1 });
export const invalidate = Effect.all([Reactivity.invalidate()], { concurrency: 1 });
