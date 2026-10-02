import { Context, Effect, Logger } from "effect";
// @ts-expect-error Legacy Effect.Service is absent.
Effect.Service();
// @ts-expect-error Legacy logger replace is absent.
Logger.replace(Logger.defaultLogger, Logger.make(() => undefined));
void Context.empty();
