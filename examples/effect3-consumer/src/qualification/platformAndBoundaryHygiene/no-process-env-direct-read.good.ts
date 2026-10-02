import { Config, ConfigProvider, Layer } from "effect";
import processAlias from "node:process";
export const value = Config.integer("Q27_VALUE");
export const provider = (input: string | undefined) => ConfigProvider.fromMap(new Map(input === undefined ? [] : [["Q27_VALUE", input]]));
export const configLayer = (input: string | undefined) => Layer.setConfigProvider(provider(input));
// Aliases/destructured process evade this literal policy, not ambient coupling.
export const opaque = () => processAlias.env.Q27_VALUE;
export const destructuredProcess = () => { const { env } = process; return env.Q27_VALUE; };
// Direct assignment is not a read; compound assignment also stays excluded, despite reading.
export const set = (input: string) => { process.env.Q27_VALUE = input; };
export const compound = () => { process.env.Q27_COUNTER += "1"; };
