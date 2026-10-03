import { Effect } from "effect";
import { Atom, AtomRegistry, valueAtom } from "./atoms";
export const atomRegistry = AtomRegistry.make();
// no-atom-registry-effect-sync: five actual registry operations.
export const read = Effect.sync(() => atomRegistry.get(valueAtom));
export const write = Effect.sync(() => atomRegistry.set(valueAtom, 42));
export const update = Effect.sync(() => atomRegistry.update(valueAtom, value => value + 1));
export const modify = Effect.sync(() => atomRegistry.modify(valueAtom, value => [value, value + 1]));
export const refresh = Effect.sync(() => atomRegistry.refresh(valueAtom));
// Five Atom calls merely construct effects; running the outer sync does not run them.
export const constructedRead = Effect.sync(() => Atom.get(valueAtom));
export const constructedWrite = Effect.sync(() => Atom.set(valueAtom, 42));
export const constructedUpdate = Effect.sync(() => Atom.update(valueAtom, value => value + 1));
export const constructedModify = Effect.sync(() => Atom.modify(valueAtom, value => [value, value + 1]));
export const constructedRefresh = Effect.sync(() => Atom.refresh(valueAtom));
// Recursive/first-match behaviour includes unused callbacks and multiple operations.
export const unused = Effect.sync(() => { const neverCalled = () => atomRegistry.set(valueAtom, 42); return 42; });
export const multiple = Effect.sync(() => { atomRegistry.set(valueAtom, 41); return atomRegistry.get(valueAtom); });
