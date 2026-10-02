// No ecosystem import: policy does not apply.
export function raw(userId: string, orderId: string, amount: number) { return [userId, orderId, amount]; }
export interface Times { createdAt: number }
export const options = (opts: any) => opts;
