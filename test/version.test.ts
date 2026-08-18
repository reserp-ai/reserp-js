import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { VERSION } from "../src/index.js";

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { version: string };

describe("package version", () => {
  it("matches the exported client version", () => {
    expect(VERSION).toBe(packageJson.version);
  });
});
