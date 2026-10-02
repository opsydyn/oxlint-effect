import { Effect, Logger, Layer } from "effect";
// @ts-expect-error Current Context.Service constructor is absent.
Context.Service("Q28");
// @ts-expect-error Current Logger.layer is absent.
Logger.layer([Logger.make(() => undefined)]);
void Layer.empty;
