import React, { createContext, createElement, useCallback, useContext, useEffect, useReducer, useState, useSyncExternalStore } from "react";
const Context = createContext(0);
const subscribe = (_listener: () => void) => () => undefined;
const snapshot = () => 21;
// linteffect/no-react-state: all six recognised hook names, bare and member.
export function Bare({ events }: { events: string[] }) {
  const [state] = useState(1);
  const [reduced] = useReducer((n: number) => n, 20);
  const context = useContext(Context);
  const current = useSyncExternalStore(subscribe, snapshot, snapshot);
  const value = useCallback(() => state + reduced + context + current, [state, reduced, context, current]);
  useEffect(() => { events.push("effect"); }, [events]);
  return createElement("span", null, value());
}
export function Member({ events }: { events: string[] }) {
  const [state] = React.useState(1);
  const [reduced] = React.useReducer((n: number) => n, 20);
  const context = React.useContext(Context);
  const current = React.useSyncExternalStore(subscribe, snapshot, snapshot);
  const value = React.useCallback(() => state + reduced + context + current, [state, reduced, context, current]);
  React.useEffect(() => { events.push("effect"); }, [events]);
  return createElement("span", null, value());
}
