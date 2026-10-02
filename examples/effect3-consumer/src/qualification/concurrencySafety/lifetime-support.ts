import { Effect } from "effect";
export interface Connection { readonly value: number; closed: boolean; closes: number; close(): Effect.Effect<void>; }
export const openConnection = (onOpen: (connection: Connection) => void) => Effect.sync(() => {
  const connection: Connection = { value: 42, closed: false, closes: 0, close: () => Effect.sync(() => { connection.closed = true; connection.closes++; }) };
  onOpen(connection);
  return connection;
});
