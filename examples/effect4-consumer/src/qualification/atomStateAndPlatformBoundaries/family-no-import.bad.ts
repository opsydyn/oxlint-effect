// Name heuristic without Effect/atom imports; ordinary objects also warn.
const itemsCollectionAtom = { answer: 42 };
const get = (value: typeof itemsCollectionAtom) => value;
const Atom = { family: <A>(create: (key: string) => A) => create };
export const ordinary = Atom.family(key => get(itemsCollectionAtom).answer);
