import { Atom, AtomRegistry } from "effect/reactivity";
export { Atom, AtomRegistry };
export const valueAtom = Atom.make(0);
export const itemsCollectionAtom = Atom.make<Readonly<Record<string, number>>>({ answer: 42, other: 0 });
