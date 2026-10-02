// @lint-expect linteffect/no-node-platform-in-shared-code: no Effect import gate.
import { platform } from "os";
export const host = platform;
