export type EffectVersion = 3 | 4;

export function effectVersionFor(options: readonly unknown[]): EffectVersion {
  const first = options[0];
  if (typeof first !== "object" || first === null || !Object.hasOwn(first, "effectVersion")) return 4;
  const value = (first as Record<string, unknown>).effectVersion;
  if (value === 3 || value === 4) return value;
  throw new Error("effectVersion must be 3 or 4");
}

export function withEffectVersionSchema(schema: readonly unknown[]): readonly unknown[] {
  const first = schema[0] as { properties?: Record<string, unknown> } | undefined;
  return [{
    type: "object",
    additionalProperties: false,
    ...first,
    properties: { ...first?.properties, effectVersion: { type: "integer", enum: [3, 4] } },
  }, ...schema.slice(1)];
}

// Compact runtime projection; tests require exact agreement with the evidence inventory.
export const versionSensitiveRules = [
  "no-console-in-effect-flow",
  "no-effect-log-without-structured-context",
  "require-span-on-public-service-method",
  "no-runpromise-in-non-async-test-body",
  "require-effect-flip-for-error-test",
  "no-test-mock-layer-when-default-available",
  "prefer-pipe-for-behavior",
  "prefer-decorated-effect-before-gen",
  "no-workflow-in-behavior-pipe",
  "no-mixed-pillar-function",
  "no-clever-effect-expression",
  "prefer-effect-service",
  "no-layer-provide-in-service-definition",
  "require-service-accessors",
  "require-service-dependencies",
  "no-manual-service-object-export",
  "no-layer-merge-in-request-handler",
  "no-service-method-returning-promise",
  "prefer-layer-pipe",
  "no-inline-layer-provide-in-program",
  "prefer-layer-mergeall-for-infrastructure",
  "no-service-layer-scatter",
  "no-json-parse-without-schema",
  "no-effect-all-step-sequencing",
  "no-async-effect-combinator-callback",
  "no-throw-in-effect-logic",
  "no-swallowed-catch-all",
  "no-try-catch-in-effect-logic",
  "no-promise-api-in-effect-logic",
  "no-wrapgraphql-catchall",
  "no-early-catchall-null",
  "no-exception-domain-error",
  "no-expected-state-as-error",
  "no-catchall-generic-rethrow",
  "no-log-only-error-handling",
  "no-fromnullable-nullish-coalesce",
  "no-hidden-effect-execution",
  "no-boundary-try-catch-without-effect-map",
  "no-run-effect-outside-boundary",
  "no-effect-async",
  "no-effect-fn-generator",
  "no-nested-effect-gen",
  "no-yield-without-star-in-effect-gen",
  "no-effect-orElse-ladder",
  "no-fire-and-forget-fork",
  "no-fork-in-loop",
  "no-race-without-cleanup",
  "no-unobserved-fiber",
  "no-blocking-call-in-effect",
  "no-promise-concurrency-in-effect",
  "no-shared-mutable-state-across-fibers",
  "no-timeout-with-noninterruptible-promise",
  "no-uninterruptible-concurrent-region",
  "no-unbounded-queue-or-pubsub",
  "no-global-mutable-concurrency-state",
  "no-manual-deferred-coordination",
  "no-acquire-without-scoped-release",
  "no-manual-resource-close",
  "no-unbound-scope",
  "no-resource-succeed-escape",
  "no-resource-without-acquire-release",
  "no-run-with-open-resource",
  "no-nested-acquire-release",
  "no-missing-layer-provision-at-run",
  "no-yield-with-held-semaphore-permit",
  "no-yield-with-held-mutable-ref",
  "no-unscoped-background-fiber",
] as const;

export const legacyOnlyRules = [
  "require-service-accessors",
  "require-service-dependencies",
  "no-effect-async",
  "no-effect-orElse-ladder",
  "no-fromnullable-nullish-coalesce",
] as const;
