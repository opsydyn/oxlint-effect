import { basename } from "node:path";
export const name = (path: string) => basename(path);
