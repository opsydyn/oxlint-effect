import { Effect, Match } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { useState } from "react";

declare const UsersCollectionAtom: unknown;
declare const ThemeAtom: unknown;
declare function get(atom: unknown): unknown;
declare function setState(value: unknown): void;
declare function renderMetric(value: unknown): JSX.Element;

export function DashboardPanel() {
  // EXPECT: linteffect/no-react-state
  // QA: React state hooks should warn in Effect/atom driven UI code.
  const [count] = useState(0);

  // EXPECT: linteffect/no-render-side-effects
  // QA: Match.value(...).pipe(...) used as a render statement should warn.
  Match.value(count).pipe(
    Match.when(0, () => Effect.succeed("empty")),
    Match.orElse(() => Effect.succeed("ready")),
  );

  // EXPECT: linteffect/no-atom-registry-effect-sync
  // QA: Atom operations wrapped in Effect.sync should warn.
  const syncAtomWrite = Effect.sync(() => Atom.set(ThemeAtom, count));

  // EXPECT: linteffect/no-family-collection-read
  // QA: Atom.family should not read broad collection atoms from keyed projections.
  const userFamily = Atom.family((id: string) => get(UsersCollectionAtom));

  // EXPECT: linteffect/no-if-statement
  // QA: The Effect ecosystem import gates imperative if-statement warnings.
  if (count > 0) {
    setState(count);
  }

  // EXPECT: linteffect/no-ternary
  // QA: Ternary expressions in Effect ecosystem files should warn.
  const label = count > 0 ? "active" : "idle";

  // EXPECT: linteffect/no-branch-in-object
  // QA: Match branches inside object literals should warn.
  const viewModel = {
    label: Match.value(label).pipe(Match.orElse((value) => value)),
  };

  return (
    <section>
      {renderMetric(viewModel.label)}
      {renderMetric(syncAtomWrite)}
      {renderMetric(userFamily)}
    </section>
  );
}
