import { Config, ConfigProvider } from "effect";
const value = Config.integer("Q27_VALUE");
void value;
// @ts-expect-error Current constructor is absent.
Config.Int("Q27_VALUE");
// @ts-expect-error Current structured provider is absent.
ConfigProvider.fromUnknown({ Q27_VALUE: "42" });
