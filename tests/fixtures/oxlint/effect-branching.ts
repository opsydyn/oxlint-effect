import { Effect } from "effect";

const program = Effect.succeed("ready");

if (program) {
  console.log("ready");
}

switch (program) {
  default:
    console.log("done");
}
