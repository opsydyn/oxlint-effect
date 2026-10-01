const assert = { equal(actual: unknown, expected: unknown) { if (actual !== expected) throw new Error(`Style repair changed value: ${String(actual)} != ${String(expected)}`); } };
import { Effect } from "effect";
import * as mixedBad from "./no-mixed-pillar-function.bad";
import * as mixedGood from "./no-mixed-pillar-function.good";
import * as cleverBad from "./no-clever-effect-expression.bad";
import * as cleverGood from "./no-clever-effect-expression.good";
import * as conceptBad from "./prefer-extracted-concept.bad";
import * as conceptGood from "./prefer-extracted-concept.good";
for (const build of [mixedBad.mixedDeclaration, mixedBad.mixedArrow, mixedBad.mixedExpression]) assert.equal(await Effect.runPromise(build()), await Effect.runPromise(mixedGood.program));
assert.equal(await Effect.runPromise(mixedBad.mixedLayer().program), await Effect.runPromise(mixedGood.program));
assert.equal(await Effect.runPromise(cleverBad.wrapped), await Effect.runPromise(cleverGood.wrapped));
assert.equal(conceptBad.ordinary[0], conceptGood.ordinary[0]);
for (const key of ["nested", "piped"] as const) assert.equal(await Effect.runPromise(cleverBad[key]), await Effect.runPromise(cleverGood[key]));
for (const key of ["direct", "piped", "expression"] as const) {
  assert.equal(await Effect.runPromise(conceptBad[key]), 4);
  assert.equal(await Effect.runPromise(conceptGood[key]), 4);
}
assert.equal(await Effect.runPromise(mixedGood.twoPillars()), 1);
assert.equal(mixedGood.transform(1), 4);
assert.equal(await Effect.runPromise(cleverGood.shallow), "1");
assert.equal(await Effect.runPromise(cleverGood.pureWorkflow), "1");
for (const program of [conceptGood.small, conceptGood.concise]) assert.equal(await Effect.runPromise(program), 4);
