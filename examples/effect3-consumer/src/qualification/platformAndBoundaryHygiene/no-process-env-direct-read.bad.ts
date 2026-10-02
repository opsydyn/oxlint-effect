// No Effect import is needed for this ambient coupling policy.
// @lint-expect linteffect/no-process-env-direct-read (ten read-shaped expressions).
export const direct = () => process.env.Q27_VALUE;
export const computed = () => process.env["Q27_VALUE"];
export const computedEnv = () => process["env"]["Q27_VALUE"];
export const dynamic = (key: string) => process.env[key];
export const optional = () => process.env?.Q27_VALUE;
export const destructured = () => { const { Q27_VALUE } = process.env; return Q27_VALUE; };
export const whole = () => { const env = process.env; return env; };
export const keys = () => Object.keys(process.env);
// Delete is retained as a read-shaped false positive.
export const remove = () => { delete process.env.Q27_DELETE; };
// Literal identifiers are not resolved: a local object named process can warn.
export const shadowed = () => { const process = { env: { Q27_VALUE: "42" } }; return process.env.Q27_VALUE; };
