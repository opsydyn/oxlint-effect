import { DatabasePool, openConnection } from "./pool-support";
// Intentional import-gate limitation, not a recommended repair.
export const unowned = () => openConnection();
export const global = new DatabasePool();
export const requestHandler = () => new DatabasePool();
