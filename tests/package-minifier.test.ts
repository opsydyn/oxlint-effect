import { describe, expect, it } from "bun:test";
import { minifyPackageChunk } from "../scripts/minify-package.ts";

describe("package minifier", () => {
  it("preserves exports, effects and thrown error identity", async () => {
    const source = `
      export const events = [];
      export const failure = new Error("original");
      export function run(value) {
        events.push(value);
        if (value === null) throw failure;
        return { value, nested: { answer: 42 } };
      }
    `;
    const result = await minifyPackageChunk(source, "index.mjs");
    expect(result).not.toBeNull();
    const output = await import(`data:text/javascript;base64,${Buffer.from(result!.code).toString("base64")}`);
    expect(output.run("ok")).toEqual({ value: "ok", nested: { answer: 42 } });
    try {
      output.run(null);
      throw new Error("expected failure");
    } catch (error) {
      expect(error).toBe(output.failure);
    }
    expect(output.events).toEqual(["ok", null]);
    expect(JSON.parse(result!.map).sources).toEqual(["index.mjs"]);
    expect(JSON.parse(result!.map).mappings.length).toBeGreaterThan(0);
  });

  it("leaves declaration chunks untouched", async () => {
    expect(await minifyPackageChunk("export type Version = 3 | 4;", "index.d.mts")).toBeNull();
  });
});
