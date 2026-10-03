import { Atom, itemsCollectionAtom } from "./atoms";
export const source = Atom.family((key: string) => Atom.make(key === "answer" ? 42 : 0));
export const byKey = Atom.family((key: string) => Atom.make(get => get(source(key))));
// Naming and receiver gaps still allow broad reads; these are not repairs.
const collection = itemsCollectionAtom;
export const renamed = Atom.family((key: string) => Atom.make(get => get(collection)[key] ?? 0));
const A = Atom;
export const alias = A.family((key: string) => Atom.make(get => get(itemsCollectionAtom)[key] ?? 0));
export const computed = Atom["family"]((key: string) => Atom.make(get => get(itemsCollectionAtom)[key] ?? 0));
