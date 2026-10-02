import { Config, ConfigProvider } from "effect";
const value = Config.Int("Q27_VALUE");
void value;
// @ts-expect-error Legacy constructor is absent.
Config.integer("Q27_VALUE");
// @ts-expect-error Legacy map provider is absent.
ConfigProvider.fromMap(new Map([["Q27_VALUE", "42"]]));
