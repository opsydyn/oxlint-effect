export const instances: DatabasePool[] = [];
export class DatabasePool {
  readonly value = 42;
  closed = false;
  closes = 0;
  constructor() { instances.push(this); }
  read() { if (this.closed) throw new Error("Pool is closed"); return this.value; }
  close() { this.closed = true; this.closes++; }
}
export const openConnection = () => new DatabasePool();
export const connectClient = openConnection;
export const createPool = openConnection;
export const startServer = openConnection;
export const listenSocket = openConnection;
export const subscribeStream = openConnection;
export const acquireHandle = openConnection;
export const vendor = { openConnection };
