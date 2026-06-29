import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("CLI pack runtime deps", () => {
  it("builds before raw npm pack as well as npm run cli:pack", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(import.meta.dirname, "../../cli/package.json"), "utf8"),
    );

    expect(pkg.scripts.prepack).toBe("npm run build");
    expect(pkg.scripts["pack:cli"]).toBe("npm pack --pack-destination ../..");
  });

  it("forces deps that nub/pnpm symlink layouts do not resolve after npm pack", () => {
    const buildScript = fs.readFileSync(
      path.resolve(import.meta.dirname, "../../cli/scripts/build-cli.js"),
      "utf8",
    );

    for (const pkg of ["@next/env", "@swc/helpers", "node-machine-id"]) {
      expect(buildScript).toContain(`ensureModuleInBundle("${pkg}")`);
    }
    expect(buildScript).toContain('pkg.replace("/", "+")');
    expect(buildScript).toContain('".nub"');
    expect(buildScript).toContain('fs.rmSync(path.join(cliAppDir, "cli")');
  });
});
