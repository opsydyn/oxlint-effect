import { Effect } from "effect";

const businessLogicInPipe = Effect.succeed(1).pipe(
  Effect.flatMap((value) => {
    if (value > 0) {
      return Effect.succeed(value + 1);
    }
    return Effect.fail("invalid");
  }),
);

const simplePipe = Effect.succeed(1).pipe(
  Effect.flatMap((value) => Effect.succeed(value + 1)),
);

void businessLogicInPipe;
void simplePipe;
