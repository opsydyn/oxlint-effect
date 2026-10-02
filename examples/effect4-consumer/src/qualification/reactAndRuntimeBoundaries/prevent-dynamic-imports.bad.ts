// linteffect/prevent-dynamic-imports: universal ImportExpression policy.
export const direct = () => import("./lazy-value");
export const awaited = async () => await import("./lazy-value");
export const template = () => import(`./lazy-value`);
export const variable = (path: string) => import(path);
