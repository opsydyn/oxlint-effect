import { Effect, Exit, Option } from "effect";
import { named as structured } from "./no-error-as-public-effect-error.good";
import { named as known } from "./no-unknown-public-error-channel.good";
import { named as consistent } from "./no-mixed-effect-error-shapes.good";

for (const program of [structured(), known(), consistent()]) {
  const exit = await Effect.runPromiseExit(program);
  if (!Exit.isFailure(exit)) throw new Error("Tagged failure disappeared");
  const failure = Exit.findErrorOption(exit);
  if (!Option.isSome(failure) || failure.value._tag !== "UserNotFound" || failure.value.userId !== "user-1") throw new Error("Domain failure payload changed");
  const recovered = await Effect.runPromise(program.pipe(Effect.catchTag("UserNotFound", (error) => Effect.succeed(error.userId))));
  if (recovered !== "user-1") throw new Error("Typed recovery changed");
}
console.log("Public error contract checks passed");
