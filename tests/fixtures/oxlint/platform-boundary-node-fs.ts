import { Effect } from "effect";
import * as fs from "fs";
import * as nodeFs from "node:fs";
import * as fsPromises from "fs/promises";

declare const require: (source: string) => unknown;

const nodeFsPromises = require("node:fs/promises");

void Effect;
void fs;
void nodeFs;
void fsPromises;
void nodeFsPromises;
