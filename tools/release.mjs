#!/usr/bin/env node
/**
 * Release a `brain-v*` tag (spec/skills-delivery.md §10.2), from the release workflow. Refuses, creating nothing, when the
 * tag is malformed, its commit isn't on main or lacks successful CI on main, it is already released, or its version is
 * not higher than every released one. Otherwise builds, validates and publishes the snapshot as a GitHub release.
 *
 *   GH_TOKEN=… GITHUB_REPOSITORY=owner/repo node tools/release.mjs --tag brain-v1.0.0 [--dry-run]
 */
import { execFileSync } from "node:child_process";
import { mkdtemp, readdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { ROOT, loadSchema, parseArgs, repositoryUrl, run } from "./lib/cli.mjs";
import { git, gitOk } from "./lib/git.mjs";
import { releaseNotes, releaseRefusal, tagVersion, TAG_PREFIX } from "./lib/release.mjs";
import { buildSnapshot, sha256, validateSnapshot, writeSnapshot } from "./lib/snapshot.mjs";

const gh = (args) => execFileSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const repo = () => {
  if (!process.env.GITHUB_REPOSITORY) throw new Error("GITHUB_REPOSITORY is not set");
  return process.env.GITHUB_REPOSITORY;
};

function releasedTags() {
  const pages = JSON.parse(gh(["api", "--paginate", "--slurp", `repos/${repo()}/releases?per_page=100`]));
  return pages.flat().map((release) => release.tag_name).filter((tag) => tag.startsWith(TAG_PREFIX));
}

function checkRuns(sha) {
  const pages = JSON.parse(gh(["api", "--paginate", "--slurp", `repos/${repo()}/commits/${sha}/check-runs?per_page=100`]));
  return pages.flatMap((page) => page.check_runs).filter((run) => run.app?.slug === "github-actions").map((run) => ({ name: run.name, conclusion: run.conclusion }));
}

await run(async () => {
  const args = parseArgs(process.argv.slice(2));
  if (typeof args.tag !== "string") throw new Error("usage: release.mjs --tag brain-v<version> [--dry-run]");
  const tag = args.tag;
  const sha = git(ROOT, ["rev-parse", "--verify", `refs/tags/${tag}^{commit}`]).trim();
  git(ROOT, ["fetch", "--quiet", "origin", "main"]);
  const refusal = releaseRefusal({
    tag,
    onMain: gitOk(ROOT, ["merge-base", "--is-ancestor", sha, "FETCH_HEAD"]),
    checkRuns: tagVersion(tag) === null ? [] : checkRuns(sha),
    released: releasedTags(),
  });
  if (refusal !== null) throw new Error(`refused, nothing created: ${refusal}. Delete the tag (it was never released) and tag again.`);

  const version = tagVersion(tag);
  const work = await mkdtemp(join(tmpdir(), "ubs-release-"));
  const folder = join(work, "snapshot");
  const built = buildSnapshot({ repo: ROOT, commit: sha, version, repository: repositoryUrl(args) });
  await writeSnapshot(built, folder);
  const reason = await validateSnapshot(folder, loadSchema());
  if (reason !== null) throw new Error(`refused, nothing created: the built snapshot is invalid (${reason})`);

  const tarball = join(work, `ultimate-brain-skills-${version}.tar.gz`);
  execFileSync("tar", ["-czf", tarball, "-C", folder, ...(await readdir(folder)).sort()]);
  const isAnnotated = git(ROOT, ["cat-file", "-t", `refs/tags/${tag}`]).trim() === "tag";
  const message = isAnnotated ? git(ROOT, ["tag", "-l", "--format=%(contents)", tag]) : "";
  const notesFile = join(work, "notes.md");
  await writeFile(notesFile, releaseNotes({ message, integrity: built.manifest.integrity, tarballSha256: sha256(await readFile(tarball)), cli: built.manifest.cli }));
  console.log(await readFile(notesFile, "utf8"));
  if (args["dry-run"]) {
    console.log(`dry run: would release ${tag} with ${tarball}`);
    return;
  }
  const prerelease = version.includes("-") ? ["--prerelease"] : [];
  gh(["release", "create", tag, tarball, "--repo", repo(), "--verify-tag", "--title", tag, "--notes-file", notesFile, ...prerelease]);
  console.log(`released ${tag}: ${built.manifest.integrity}`);
});
