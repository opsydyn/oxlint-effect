import { Effect } from "effect";
// linteffect/no-raw-time-domain-field: each recognised field hides units/ownership.
export interface Times {
 createdAt: number; updatedAt: Date; expiresAt: string; expiredAt: number;
 renewedAt: Date; startedAt: number; endedAt: string; deletedAt: Date;
 timestamp: number; timeoutMs: number; durationMs: number; ttlMs: number; ttl: number;
}
export type Inline = { createdAt: number };
export type Optional = { expiresAt?: number };
export const task = Effect.succeed(42);
