import { Effect, Ref } from "effect";
import { initial, type State } from "./state-model";
// no-naked-object-state-update: seven recognised transition/rebuild/JSON shapes.
export const update = (ref: Ref.Ref<State>) => Ref.update(ref, state => ({ ...state, count: 42 }));
export const modify = (ref: Ref.Ref<State>) => Ref.modify(ref, state => [state.count, { ...state, count: state.count + 1 }]);
export const assign = (state: State) => Object.assign({}, state, { count: 42 });
export const entries = (state: State) => Object.fromEntries(Object.entries(state));
export const encode = (state: State) => JSON.stringify(state);
export const decode = (wire: string): unknown => JSON.parse(wire);
export const unused = (ref: Ref.Ref<State>) => Ref.update(ref, state => { const neverCalled = () => ({ ...state }); return state; });
