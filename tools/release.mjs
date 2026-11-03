#!/usr/bin/env node
/**
 * Release a `brain-v*` tag (spec/skills-delivery.md §10.2), from the release workflow. Refuses, creating nothing, when the
 * tag is malformed, its commit isn't on main or lacks successful CI on main, it is already released, or its version is
 * not higher than every released one. Otherwise builds, validates and publishes the snapshot as a GitHub release.
 *
 *   GH_TOKEN=… GITHUB_REPOSITORY=owner/repo node tools/release.mjs --tag brain-v1.0.0 [--dry-run]
 */
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { ROOT, loadSchema, parseArgs, repositoryUrl, run } from "./lib/cli.mjs";
import { git, gitOk } from "./lib/git.mjs";
import { prepareRelease, releaseRefusal, tagVersion, TAG_PREFIX } from "./lib/release.mjs";

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
  const pages = JSON.parse(gh(["api", "--paginate", "--slurp", `repos/${repo()}/commits/${sha}/check-runs?filter=latest&per_page=100`]));
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

  const work = await mkdtemp(join(tmpdir(), "ubs-release-"));
  let prepared;
  try {
    prepared = await prepareRelease({ repo: ROOT, tag, repository: repositoryUrl(args), work, schema: loadSchema() });
  } catch (error) {
    throw new Error(`refused, nothing created: ${error.message}`);
  }
  const notesFile = join(work, "notes.md");
  await writeFile(notesFile, prepared.notes);
  console.log(await readFile(notesFile, "utf8"));
  if (args["dry-run"]) {
    console.log(`dry run: would release ${tag} with ${prepared.tarball}`);
    return;
  }
  const prerelease = prepared.prerelease ? ["--prerelease"] : [];
  gh(["release", "create", tag, prepared.tarball, "--repo", repo(), "--verify-tag", "--title", tag, "--notes-file", notesFile, ...prerelease]);
  console.log(`released ${tag}: ${prepared.manifest.integrity}`);
});
