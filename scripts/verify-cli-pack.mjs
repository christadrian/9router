#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const tarball = process.argv[2] || join(process.cwd(), "9router-0.5.15.tgz");
if (!existsSync(tarball)) throw new Error(`missing tarball: ${tarball}`);

const entries = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" });
for (const needle of [
  "package/app/node_modules/@next/env/package.json",
  "package/app/node_modules/@swc/helpers/package.json",
]) {
  if (!entries.includes(needle)) throw new Error(`missing bundled dep: ${needle}`);
}

const dir = mkdtempSync(join(tmpdir(), "9router-pack-"));
try {
  execFileSync("tar", ["-xzf", tarball, "-C", dir]);
  const root = join(dir, "package");
  const checkFile = join(dir, "check.cjs");
  writeFileSync(checkFile, `
    const root = ${JSON.stringify(root)};
    require(root + "/src/cli/api/client.js");
    require.resolve("@next/env", { paths: [root + "/app"] });
    require.resolve("@swc/helpers/_/_interop_require_default", { paths: [root + "/app"] });
    const fs = require("node:fs"), path = require("node:path");
    const chunks = path.join(root, "app/.next-cli-build/server/chunks");
    const haystack = fs.readdirSync(chunks).map(f => fs.readFileSync(path.join(chunks, f), "utf8")).join("\\n");
    for (const marker of ["custom_tool_call", "customToolNames", "custom_tool_call_output"]) {
      if (!haystack.includes(marker)) throw new Error("missing custom-tool marker: " + marker);
    }
  `);
  execFileSync(process.execPath, [checkFile], { stdio: "inherit" });
  console.log(`pack ok: ${tarball}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
