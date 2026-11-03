#!/usr/bin/env node
/**
 * Build the snapshot of one commit (spec/skills-delivery.md §10.2) and validate it (§2.3).
 *
 *   node tools/build-snapshot.mjs --commit <ref> --version <semver> --out <empty folder> [--repository <url>]
 */
import { ROOT, loadSchema, parseArgs, repositoryUrl, run } from "./lib/cli.mjs";
import { buildSnapshot, validateSnapshot, writeSnapshot } from "./lib/snapshot.mjs";

await run(async () => {
  const args = parseArgs(process.argv.slice(2));
  if (typeof args.commit !== "string" || typeof args.version !== "string" || typeof args.out !== "string") {
    throw new Error("usage: build-snapshot.mjs --commit <ref> --version <semver> --out <folder> [--repository <url>]");
  }
  const built = buildSnapshot({ repo: ROOT, commit: args.commit, version: args.version, repository: repositoryUrl(args) });
  await writeSnapshot(built, args.out);
  const reason = await validateSnapshot(args.out, loadSchema());
  if (reason !== null) throw new Error(`the built snapshot is invalid: ${reason}`);
  console.log(`built ${built.manifest.name} ${built.manifest.version} at ${built.manifest.source.commit}: ${built.manifest.skills.length} skills, ${built.manifest.integrity}`);
});
