import { describe, expect, it } from "bun:test";

const packageJson = await Bun.file("package.json").json() as {
  bugs?: { url?: string };
  homepage?: string;
  repository?: { type?: string; url?: string };
};

describe("package metadata", () => {
  it("declares the GitHub repository required by npm provenance", () => {
    expect(packageJson.repository).toEqual({
      type: "git",
      url: "https://github.com/opsydyn/oxlint-effect",
    });
  });

  it("points package links at the published repository", () => {
    expect(packageJson.bugs?.url).toBe("https://github.com/opsydyn/oxlint-effect/issues");
    expect(packageJson.homepage).toBe("https://github.com/opsydyn/oxlint-effect#readme");
  });
});
