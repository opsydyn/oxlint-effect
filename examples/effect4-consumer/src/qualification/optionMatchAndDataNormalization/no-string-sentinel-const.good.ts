export const ready = { _tag: "Ready", value: 42 } as const;
export const pending = { _tag: "Pending" } as const;
// String-containing aggregates/const assertions/templates are exact-shape gaps.
export const hidden = { status: "ready" };
export const literal = "ready" as const;
export const template = `ready`;
export enum Lifecycle { Ready = "ready", Pending = "pending" }
