import { increment, double, offset } from "./pure-steps";
// Ecosystem import is after the declaration: preserved import-order gap.
export const value = offset(double(increment(1)));
import { flow } from "effect";
export const marker = flow(increment);
