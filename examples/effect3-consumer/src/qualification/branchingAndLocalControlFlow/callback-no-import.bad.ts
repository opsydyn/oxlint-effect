// No imports: callback-return owners are not gated.
export const arrow = [1].map(n => { return n + 41; });
export const regular = [1].map(function(n) { return n + 41; });
