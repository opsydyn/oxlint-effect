import { Effect } from "effect";
const program = Effect.fail("broken");
// EXPECT: linteffect/no-effect-ignore (direct)
export const direct = Effect.ignore(program);
// EXPECT: linteffect/no-effect-ignore (piped reference)
export const piped = program.pipe(Effect.ignore);
