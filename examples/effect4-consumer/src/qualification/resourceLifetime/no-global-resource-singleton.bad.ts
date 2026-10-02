import { Effect } from "effect";
import { DatabasePool } from "./pool-support";
export const driver = { DatabasePool };
// @lint-expect linteffect/no-global-resource-singleton
export const client = new DatabasePool();
// @lint-expect linteffect/no-global-resource-singleton
export const pool = new driver.DatabasePool();
// @lint-expect linteffect/no-global-resource-singleton
export const connection = new DatabasePool();
export let blockPool: DatabasePool;
{
  // @lint-expect linteffect/no-global-resource-singleton
  blockPool = new DatabasePool();
}
export class Registry {
  // @lint-expect linteffect/no-global-resource-singleton
  static readonly client = new DatabasePool();
}
export const value = Effect.succeed(42);
