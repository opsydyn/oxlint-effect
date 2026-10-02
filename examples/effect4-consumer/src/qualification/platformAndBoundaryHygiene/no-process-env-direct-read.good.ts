import { Config, ConfigProvider, Effect } from "effect";
import processAlias from "node:process";
export const value = Config.Int("Q27_VALUE");
export const provider = (input: string | undefined) => ConfigProvider.fromUnknown(input === undefined ? {} : { Q27_VALUE: input });
export const configLayer = (input: string | undefined) => ConfigProvider.layer(provider(input));
// Aliases/destructured process evade this literal policy, not ambient coupling.
export const opaque = () => processAlias.env.Q27_VALUE;
export const destructuredProcess = () => { const { env } = process; return env.Q27_VALUE; };
// Direct assignment is not a read; compound assignment also stays excluded, despite reading.
export const set = (input: string) => { process.env.Q27_VALUE = input; };
export const compound = () => { process.env.Q27_COUNTER += "1"; };
