#!/usr/bin/env node
/**
 * Reproduce a released snapshot from its tag (spec/skills-delivery.md §12.2 item 1): download the release's tarball,
 * rebuild the tag's commit, and check that both validate (§2.3), that every file is byte-identical, and that the notes'
 * Integrity and Tarball-SHA256 lines match.
 *
 *   node tools/verify-release.mjs --tag brain-v1.0.0 [--repo owner/ultimate-brain-skills]
 */
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { ROOT, loadSchema, parseArgs, run } from "./lib/cli.mjs";
import { git } from "./lib/git.mjs";
import { listFiles, snapshotDifference, tagVersion } from "./lib/release.mjs";
import { buildSnapshot, sha256, validateSnapshot, writeSnapshot } from "./lib/snapshot.mjs";

await run(async () => {
  const args = parseArgs(process.argv.slice(2));
  const repo = typeof args.repo === "string" ? args.repo : process.env.GITHUB_REPOSITORY;
  if (typeof args.tag !== "string" || !repo) throw new Error("usage: verify-release.mjs --tag brain-v<version> --repo <owner>/<repo>");
  const version = tagVersion(args.tag);
  if (version === null) throw new Error(`${args.tag} is not a brain-v tag`);
  const work = await mkdtemp(join(tmpdir(), "ubs-verify-"));
  const download = join(work, "download");
  const released = join(work, "released");
  const rebuilt = join(work, "rebuilt");
  execFileSync("gh", ["release", "download", args.tag, "--repo", repo, "--dir", download]);
  const tarball = join(download, `ultimate-brain-skills-${version}.tar.gz`);
  await mkdir(released);
  execFileSync("tar", ["-xzf", tarball, "-C", released]);

  git(ROOT, ["fetch", "--quiet", "--force", "origin", `refs/tags/${args.tag}:refs/tags/${args.tag}`]);
  const built = buildSnapshot({ repo: ROOT, commit: `refs/tags/${args.tag}`, version, repository: `https://github.com/${repo}` });
  await writeSnapshot(built, rebuilt);

  const schema = loadSchema();
  for (const [label, folder] of [["released", released], ["rebuilt", rebuilt]]) {
    const reason = await validateSnapshot(folder, schema);
    if (reason !== null) throw new Error(`${label} snapshot is invalid: ${reason}`);
  }
  const difference = await snapshotDifference(released, rebuilt);
  if (difference !== null) throw new Error(`the release and the rebuild differ: ${difference}`);
  const notes = JSON.parse(execFileSync("gh", ["release", "view", args.tag, "--repo", repo, "--json", "body"], { encoding: "utf8" })).body;
  const integrity = built.manifest.integrity;
  if (!notes.includes(`Integrity: ${integrity}`)) throw new Error(`the notes' Integrity line doesn't say ${integrity}`);
  if (!notes.includes(`Tarball-SHA256: ${sha256(await readFile(tarball))}`)) throw new Error("the notes' Tarball-SHA256 line doesn't match the asset");
  console.log(`reproduced ${args.tag}: ${(await listFiles(released)).length} files byte-identical, both valid, integrity ${integrity}`);
});
