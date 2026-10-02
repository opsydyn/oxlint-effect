import { Effect } from "effect";
// linteffect/no-boolean-domain-flag: each prefixed boolean hides intent.
export function notify(shouldNotify: boolean) { return Effect.succeed(shouldNotify); }
export function active(isActive: boolean) { return isActive; }
export function owner(hasOwner: boolean) { return hasOwner; }
export function receipt(withReceipt: boolean) { return withReceipt; }
export function retries(allowRetry: boolean) { return allowRetry; }
export function auditing(enableAudit: boolean) { return enableAudit; }
export const archive = (canArchive: boolean) => canArchive;
export const cache = function(useCache: boolean) { return useCache; };
export function multiple(shouldNotify: boolean, allowRetry: boolean) { return [shouldNotify, allowRetry]; }
