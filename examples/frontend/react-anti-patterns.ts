import { Effect, Match } from "effect";

declare const count: number;
declare const useState: (initialValue: number) => readonly [number, (value: number) => void];

// EXPECT: linteffect/no-react-state
// QA: React state hooks should be replaced with Effect Atom state.
const [selected] = useState(count);

// EXPECT: linteffect/no-render-side-effects
// QA: Match branching must remain a pure render expression.
Match.value(count).pipe(
  Match.when(0, () => Effect.succeed(count)),
);

void selected;
