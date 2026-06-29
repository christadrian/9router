import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("CLI pack runtime deps", () => {
  it("forces deps that nub/pnpm symlink layouts do not resolve after npm pack", () => {
    const buildScript = fs.readFileSync(
      path.resolve(import.meta.dirname, "../../cli/scripts/build-cli.js"),
      "utf8",
    );

    expect(buildScript).toContain('ensureModuleInBundle("@swc/helpers")');
    expect(buildScript).toContain('ensureModuleInBundle("node-machine-id")');
    expect(buildScript).toContain('pkg.replace("/", "+")');
    expect(buildScript).toContain('".nub"');
  });
});
