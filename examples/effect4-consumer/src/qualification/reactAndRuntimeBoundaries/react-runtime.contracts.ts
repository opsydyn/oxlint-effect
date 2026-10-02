import { Cause, Effect, Exit, Result, Ref } from "effect";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as bad from "./no-react-state.bad";
import * as good from "./react-state.good";
import * as die from "./no-or-die-outside-boundary.bad";
import * as typed from "./typed-failure.good";
import { Context, Fiber } from "effect";
const events: string[] = [];
const state = await Effect.runPromise(Ref.make(42));
const value = await Effect.runPromise(good.read(state));
const repaired = renderToStaticMarkup(createElement(good.View, { value }));
for (const component of [bad.Bare, bad.Member]) if (renderToStaticMarkup(createElement(component, { events })) !== repaired) throw new Error("React server output changed");
if (repaired !== "<span>42</span>" || events.length !== 0) throw new Error("SSR contract changed; effects must not execute on the server");
for (const component of [good.Alias, good.Computed]) if (renderToStaticMarkup(createElement(component)) !== repaired) throw new Error("Hook syntax control changed");
for (const program of [die.direct, die.member, die.free]) {
  const exit = await Effect.runPromiseExit(program);
  if (!Exit.isFailure(exit)) throw new Error("orDie unexpectedly succeeded");
  const defect = Cause.findDefect(exit.cause);
  if (!Result.isSuccess(defect) || defect.success !== die.original) throw new Error("Defect identity changed");
}
if (await Effect.runPromise(Effect.flip(typed.task)) !== typed.original) throw new Error("Typed repair lost recoverable error identity");
const fiber = Effect.runForkWith(Context.empty())(Effect.succeed(42));
if (await Effect.runPromise(Fiber.join(fiber)) !== 42) throw new Error("Current context runner changed");
