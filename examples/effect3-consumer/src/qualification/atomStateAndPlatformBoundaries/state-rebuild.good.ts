import { Ref, Record, Schema, Struct } from "effect";
import { State } from "./state-model";
export const next = (state: State) => State.make(Struct.evolve(state, { count: () => 42 }));
export const update = (ref: Ref.Ref<State>) => Ref.update(ref, next);
export const modify = (ref: Ref.Ref<State>) => Ref.modify(ref, state => [state.count, State.make(Struct.evolve(state, { count: count => count + 1 }))]);
export const updateItem = (state: State) => State.make(Struct.evolve(state, { items: items => Record.set(items, "answer", 42) }));
export const incrementItem = (state: State) => State.make(Struct.evolve(state, { items: items => Record.modify(items, "answer", value => value + 1) }));
export const removeItem = (state: State) => State.make(Struct.evolve(state, { items: items => Record.remove(items, "answer") }));
export const Wire = Schema.parseJson(State);
export const encode = Schema.encodeSync(Wire);
export const decode = Schema.decodeUnknownSync(Wire);
// Gaps/ordinary valid shapes, not endorsed transition repairs.
export const curriedSpread = Ref.update((state: State) => ({ ...state, count: 42 }));
export const twoArgumentAssign = (state: State) => Object.assign({}, state);
export const literalEntries = () => Object.fromEntries([["answer", 42]]);
const stringify = JSON.stringify;
export const alias = (state: State) => stringify(state);
export const computed = (state: State) => JSON["stringify"](state);
