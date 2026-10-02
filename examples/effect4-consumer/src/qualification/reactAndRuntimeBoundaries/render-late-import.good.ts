export function pure() { Match.value(true).pipe(Match.when(true, () => 42), Match.orElse(() => 0)); return 42; }
import { Match } from "effect";
