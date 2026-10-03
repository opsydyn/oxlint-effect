import { Effect } from "effect";
import { Atom, AtomRegistry, valueAtom } from "./atoms";
export const atomRegistry = AtomRegistry.make();
// Event/action ownership remains deferred; do not eagerly mutate at construction.
export const write = () => atomRegistry.set(valueAtom, 42);
export const read = () => atomRegistry.get(valueAtom);
export const update = () => atomRegistry.update(valueAtom, value => value + 1);
export const modify = () => atomRegistry.modify(valueAtom, value => [value, value + 1]);
export const refresh = () => atomRegistry.refresh(valueAtom);
// Native effectful atom operations remain lazy and require actual registry provision.
export const effectWrite = Atom.set(valueAtom, 42);
export const effectRead = Atom.get(valueAtom);
// Alias/computed/named callback gaps are not endorsed as fixes.
const registry = atomRegistry;
export const alias = Effect.sync(() => registry.set(valueAtom, 42));
export const computed = Effect.sync(() => atomRegistry["set"](valueAtom, 42));
const named = () => atomRegistry.set(valueAtom, 42);
export const namedCallback = Effect.sync(named);
