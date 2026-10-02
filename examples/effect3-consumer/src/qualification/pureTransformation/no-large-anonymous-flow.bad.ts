import { flow } from "effect";
import { increment, double, offset, identity } from "./pure-steps";
// linteffect/no-large-anonymous-flow: >=5 stages, even assigned a domain name.
export const five = flow(increment, double, offset, identity, identity);
export const six = flow(increment, double, offset, identity, identity, identity);
export const namedDomainTransformation = flow(increment, double, offset, identity, identity);
