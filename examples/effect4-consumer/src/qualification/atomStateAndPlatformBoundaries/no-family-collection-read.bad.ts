import { Atom, itemsCollectionAtom } from "./atoms";
// no-family-collection-read: recognised broad suffixes and direct get forms.
export const byKey = Atom.family((key: string) => Atom.make(get => get(itemsCollectionAtom)[key] ?? 0));
const itemsListAtom = itemsCollectionAtom;
export const list = Atom.family((key: string) => Atom.make(get => get.get(itemsListAtom)[key] ?? 0));
const VisibleItemsAtom = itemsCollectionAtom;
export const visible = Atom.family((key: string) => Atom.make(get => get(VisibleItemsAtom)[key] ?? 0));
const searchResultsAtom = itemsCollectionAtom;
export const results = Atom.family((key: string) => Atom.make(() => Atom.get(searchResultsAtom)));
const itemsReadStateAtom = itemsCollectionAtom;
export const state = Atom.family((key: string) => Atom.make(get => get(itemsReadStateAtom)[key] ?? 0));
export const multiple = Atom.family((key: string) => Atom.make(get => { const first = get(itemsCollectionAtom); return first[key] ?? get(itemsListAtom)[key] ?? 0; }));
