import { Effect } from "effect";

declare const value: number;

const addOne = (input: number) => input + 1;
const asText = (input: number) => `${input}`;
const toLabel = (input: string) => `value:${input}`;

const pureCallTower = toLabel(asText(addOne(value)));
const shortCallTower = asText(addOne(value));

void Effect.succeed(pureCallTower);
void shortCallTower;
