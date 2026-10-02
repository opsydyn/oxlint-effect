import { Effect, Scope } from "effect";
import type { Client } from "./support";
// Default boundary exclusion applies to all three Q22 rules.
export const boundary = (client: Client) => {
  client.close();
  return Effect.succeed(client);
};
export const scope = () => Scope.make();
