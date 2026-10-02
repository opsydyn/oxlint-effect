export interface Client {
  readonly value: number;
  closed: boolean;
  closes: number;
  close(): void;
  destroy(): void;
  dispose(): void;
  cleanup(): void;
}
export function makeClient(): Client {
  const release = () => { client.closed = true; client.closes++; };
  const client: Client = { value: 42, closed: false, closes: 0, close: release, destroy: release, dispose: release, cleanup: release };
  return client;
}
