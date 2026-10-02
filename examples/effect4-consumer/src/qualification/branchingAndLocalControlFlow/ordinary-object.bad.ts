// Ordinary same-name local object; no import gate or symbol resolution.
const Option = { match: (n: number) => n };
export const value = { value: Option.match(42) };
