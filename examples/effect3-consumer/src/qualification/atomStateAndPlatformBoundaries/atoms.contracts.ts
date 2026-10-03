import { Effect, Logger } from "effect";
import { Atom, AtomRegistry, valueAtom, itemsCollectionAtom } from "./atoms";
import * as bad from "./no-atom-registry-effect-sync.bad";
import * as good from "./registry-actions.good";
import * as logBad from "./no-effect-sync-console.bad";
import * as logGood from "./logging.good";
import * as familyBad from "./no-family-collection-read.bad";
import * as familyGood from "./keyed-family.good";
const entries: unknown[] = [];
const logger = Logger.make<unknown, void>(options => { entries.push(options.message); });
const loggerLayer = Logger.replace(Logger.defaultLogger, logger);
const saved = console.log;
let printed = 0;
console.log = () => { printed += 1; };
try {
  if (await Effect.runPromise(Effect.provide(logBad.direct, loggerLayer)) !== 42 || printed !== 1 || entries.length !== 0) throw new Error("Console bypass changed");
  if (await Effect.runPromise(Effect.provide(logGood.observed, loggerLayer)) !== 42 || printed !== 1 || !Object.is(entries.length, 1)) throw new Error("Logger repair changed routing/value");
} finally { console.log = saved; }
const registry = AtomRegistry.make();
const releaseBad = bad.atomRegistry.mount(valueAtom);
const releaseGood = good.atomRegistry.mount(valueAtom);
try {
  if (bad.atomRegistry.get(valueAtom) !== 0 || good.atomRegistry.get(valueAtom) !== 0) throw new Error("Construction performed eager mutation");
  await Effect.runPromise(bad.write); good.write();
  if (await Effect.runPromise(bad.read) !== good.read() || good.read() !== 42) throw new Error("Deferred owned writes/reads changed");
  await Effect.runPromise(bad.update); good.update();
  if (await Effect.runPromise(bad.modify) !== good.modify() || good.read() !== 44) throw new Error("Update/modify changed");
  await Effect.runPromise(bad.refresh); good.refresh();
  bad.atomRegistry.set(valueAtom, 0);
  const constructed = await Effect.runPromise(bad.constructedWrite);
  if (!Effect.isEffect(constructed) || bad.atomRegistry.get(valueAtom) !== 0) throw new Error("Outer sync unexpectedly ran inner atom effect");
  await Effect.runPromise(Effect.provideService(constructed, AtomRegistry.AtomRegistry, bad.atomRegistry));
  await Effect.runPromise(Effect.provideService(good.effectWrite, AtomRegistry.AtomRegistry, good.atomRegistry));
  if (bad.atomRegistry.get(valueAtom) !== 42 || good.atomRegistry.get(valueAtom) !== 42) throw new Error("Native atom effect did not execute with registry");
  for (const key of ["answer", "other", "missing"]) if (registry.get(familyBad.byKey(key)) !== registry.get(familyGood.byKey(key))) throw new Error("Keyed projection value changed");
  const broad = familyBad.byKey("answer"); const keyed = familyGood.byKey("answer");
  const unmountBroad = registry.mount(broad); const unmountKeyed = registry.mount(keyed);
  try {
    registry.set(itemsCollectionAtom, { answer: 43, other: 1 });
    registry.set(familyGood.source("answer"), 43);
    if (registry.get(broad) !== 43 || registry.get(keyed) !== 43) throw new Error("Mounted keyed update lost");
  } finally { unmountBroad(); unmountKeyed(); }
} finally { releaseBad(); releaseGood(); registry.dispose(); bad.atomRegistry.dispose(); good.atomRegistry.dispose(); }
