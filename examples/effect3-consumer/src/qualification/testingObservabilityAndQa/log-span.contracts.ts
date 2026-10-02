import { Cause, Deferred, Effect, Exit, Fiber, Logger, Tracer, HashMap } from "effect";
import * as consoleBad from "./no-console-in-effect-flow.bad";
import * as consoleGood from "./no-console-in-effect-flow.good";
import * as logBad from "./no-effect-log-without-structured-context.bad";
import * as logGood from "./no-effect-log-without-structured-context.good";
import * as spanBad from "./require-span-on-public-service-method.bad";
import * as spanGood from "./require-span-on-public-service-method.good";
import { original } from "./failure";
const entries: Array<{ message: unknown; requestId: unknown }> = [];
const logger = Logger.make<unknown, void>(options => {
  entries.push({ message: options.message, requestId: HashMap.get(options.annotations, "requestId") });
});
const loggerLayer = Logger.replace(Logger.defaultLogger, logger);
function failure(exit: Exit.Exit<unknown, unknown>, traced = false) {
  if (!Exit.isFailure(exit)) throw new Error("Failure disappeared");
  const error = Cause.failureOption(exit.cause);
  if (error._tag !== "Some" || (traced ? Cause.originalError(error.value) : error.value) !== original) throw new Error(`Original error identity changed: ${Cause.pretty(exit.cause)}`);
}
const savedWarn = console.warn;
let nativeWarnings = 0;
console.warn = () => { nativeWarnings += 1; };
try {
  if (await Effect.runPromise(Effect.provide(consoleBad.sync, loggerLayer)) !== 42 || entries.length !== 0 || nativeWarnings !== 1) throw new Error("Console bypass counterexample changed");
  if (await Effect.runPromise(Effect.provide(consoleGood.observed, loggerLayer)) !== 42 || !Object.is(entries.length, 1) || nativeWarnings !== 1) throw new Error("Effect logger repair changed result or routing");
  if (await Effect.runPromise(consoleBad.unused) !== 42 || nativeWarnings !== 1) throw new Error("Unused callback warning counterexample changed");
} finally { console.warn = savedWarn; }
entries.length = 0;
for (const task of [logBad.recover, logBad.tagged, logBad.tags, logBad.template, logGood.structured, logGood.empty, logGood.markerOnly]) if (await Effect.runPromise(Effect.provide(task, loggerLayer)) !== 42) throw new Error("Recovery logging changed value");
for (const task of [logBad.observe, logGood.annotated]) failure(await Effect.runPromiseExit(Effect.provide(task, loggerLayer)));
const annotated = entries.at(-1);
if (!annotated || typeof annotated.requestId !== "object" || annotated.requestId === null || Reflect.get(annotated.requestId, "_tag") !== "Some" || Reflect.get(annotated.requestId, "value") !== "q28") throw new Error("Log annotation was not propagated");
const structured = entries[4];
if (!structured || !Array.isArray(structured.message) || !structured.message.includes(original)) throw new Error("Structured error identity lost from log");
const spans: Tracer.Span[] = [];
const ends = new Map<Tracer.Span, number>();
function observe(span: Tracer.Span) {
  spans.push(span); ends.set(span, 0);
  const end = span.end;
  span.end = (time, exit) => { ends.set(span, (ends.get(span) ?? 0) + 1); end.call(span, time, exit); };
  return span;
}
const base = Effect.runSync(Effect.tracer);
const tracer = Tracer.make({ span: (...args) => observe(base.span(...args)), context: (f, fiber) => base.context(f, fiber) });
const trace = <A, E>(task: Effect.Effect<A, E>) => Effect.withTracer(task, tracer);
if (await Effect.runPromise(trace(spanBad.named())) !== 42 || !Object.is(spans.length, 0)) throw new Error("Untraced operation counterexample changed");
if (await Effect.runPromise(trace(spanGood.named())) !== 42 || !Object.is(spans.length, 1) || spans[0].status._tag !== "Ended" || ends.get(spans[0]) !== 1) throw new Error("Span repair did not create and end one span");
for (const mode of ["value", "failure", "interrupt"] as const) {
  const before: number = spans.length;
  const ready = await Effect.runPromise(Deferred.make<void>());
  const gate = await Effect.runPromise(Deferred.make<number, typeof original>());
  const task = Effect.gen(function* () { yield* Deferred.succeed(ready, undefined); return yield* Deferred.await(gate); });
  const fiber = Effect.runFork(trace(spanGood.exit(task)));
  await Effect.runPromise(Deferred.await(ready));
  if (spans.length !== before + 1 || spans.at(-1)?.status._tag !== "Started") throw new Error("Span ownership did not cover pending operation");
  if (mode === "value") await Effect.runPromise(Deferred.succeed(gate, 42));
  else if (mode === "failure") await Effect.runPromise(Deferred.fail(gate, original));
  else await Effect.runPromise(Fiber.interrupt(fiber));
  const exit = await Effect.runPromise(Fiber.await(fiber));
  if (mode === "value") { if (!Exit.isSuccess(exit) || exit.value !== 42) throw new Error("Spanned value changed"); }
  // Legacy tracing proxies failures; the public originalError API recovers the original instance.
  else if (mode === "failure") failure(exit, true);
  else if (!Exit.isFailure(exit) || !(Cause.isInterrupted(exit.cause))) throw new Error("Spanned interruption changed");
  const span = spans.at(-1);
  if (!span || span.status._tag !== "Ended" || ends.get(span) !== 1) throw new Error("Span did not end exactly once");
  await Effect.runPromise(Deferred.interrupt(gate));
}
const beforeDisabled = spans.length;
if (await Effect.runPromise(trace(spanGood.disabled())) !== 42 || spans.length !== beforeDisabled) throw new Error("Disabled-tracer syntax counterexample changed");
const service = await Effect.runPromise(Effect.provide(spanGood.SpanService, spanGood.SpanService.Default));
if (await Effect.runPromise(trace(service.load())) !== 42) throw new Error("Legacy service span changed result");
