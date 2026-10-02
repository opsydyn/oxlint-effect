// No React import or receiver ownership: ordinary same-name method warns.
const tools = { useState: () => 42 };
export const value = tools.useState();
