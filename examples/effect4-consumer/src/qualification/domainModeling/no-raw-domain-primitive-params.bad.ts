import { Effect } from "effect";
// linteffect/no-raw-domain-primitive-params: >=3 matched raw domain parameters.
export function transfer(fromAccountId: string, toAccountId: string, amount: number) { return Effect.succeed({ fromAccountId, toAccountId, amount }); }
export const arrow = (userId: string, orderId: string, total: number) => [userId, orderId, total];
export const expression = function(account: string, currency: string, price: number) { return [account, currency, price]; };
export function many(invoiceId: string, customerId: string, quantity: number, payment: number) { return [invoiceId, customerId, quantity, payment]; }
