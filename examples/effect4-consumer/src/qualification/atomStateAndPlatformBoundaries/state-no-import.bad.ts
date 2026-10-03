// Global raw-JSON policy also warns without Effect imports or transition context.
export const ordinaryEncode = (value: number) => JSON.stringify(value);
export const ordinaryDecode = (wire: string): unknown => JSON.parse(wire);
