import { flow } from "effect";
import { increment, double, offset, identity } from "./pure-steps";
// linteffect/prefer-flow-for-pure-pipeline: max nested call depth >=3, outer only.
export const three = offset(double(increment(1)));
export const four = identity(offset(double(increment(1))));
const combine = (a: number, b: number) => a + b;
export const branched = combine(offset(double(increment(1))), offset(double(increment(1))));
const tools = { increment, double, offset };
export const members = tools.offset(tools.double(tools.increment(1)));
export const computed = tools["offset"](tools["double"](tools["increment"](1)));
const factory = () => (n: number) => () => n + 41;
export const curried = factory()(1)();
// Callee definitions are not resolved; purity cannot be proved from a name.
export function observable(events: string[]) { const touch = (n: number) => { events.push("touch"); return n + 41; }; return identity(identity(touch(1))); }
export const marker = flow(identity);
