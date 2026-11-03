#!/usr/bin/env node
/**
 * Validate a snapshot folder (spec/skills-delivery.md §2.3) against the vendored schema.
 *
 *   node tools/validate-snapshot.mjs <folder>   prints "valid <integrity>" or the reason; exit 1 when invalid
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { loadSchema, run } from "./lib/cli.mjs";
import { validateSnapshot } from "./lib/snapshot.mjs";

await run(async () => {
  const folder = process.argv[2];
  if (folder === undefined || process.argv.length > 3) throw new Error("usage: validate-snapshot.mjs <folder>");
  const reason = await validateSnapshot(folder, loadSchema());
  if (reason !== null) throw new Error(`invalid snapshot: ${reason}`);
  const manifest = JSON.parse(await readFile(join(folder, "snapshot.json"), "utf8"));
  console.log(`valid ${manifest.name} ${manifest.version} ${manifest.integrity}`);
});
