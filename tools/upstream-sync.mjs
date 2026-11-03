#!/usr/bin/env node
/**
 * Upstream-change detection (spec/skills-delivery.md §10.5), run daily by .github/workflows/upstream-sync.yml.
 * Opens or updates one PR from `upstream-sync`, or one issue on a conflict or rewritten history. Never merges.
 *
 *   UPSTREAM_SYNC_TOKEN=… GITHUB_REPOSITORY=owner/ultimate-brain-skills node tools/upstream-sync.mjs
 *
 * Works in a temporary worktree of this clone, whose `origin` must accept pushes with the same token.
 */
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { ROOT, run } from "./lib/cli.mjs";
import { git } from "./lib/git.mjs";
import { githubApi } from "./lib/github.mjs";
import { syncUpstream } from "./lib/sync.mjs";

await run(async () => {
  const token = process.env.UPSTREAM_SYNC_TOKEN;
  if (!token) throw new Error("UPSTREAM_SYNC_TOKEN is not set. Add it as an Actions secret (see NOTICE.md); this workflow never falls back to GITHUB_TOKEN.");
  if (!process.env.GITHUB_REPOSITORY) throw new Error("GITHUB_REPOSITORY is not set");
  const api = githubApi({ token, repository: process.env.GITHUB_REPOSITORY });
  await api.verify();

  git(ROOT, ["fetch", "--quiet", "--no-tags", "origin", "main"]);
  const upstreamUrl = JSON.parse(git(ROOT, ["show", "FETCH_HEAD:upstream.json"])).repository;
  const work = join(await mkdtemp(join(tmpdir(), "ubs-sync-")), "fork");
  git(ROOT, ["worktree", "add", "--quiet", "--detach", work, "FETCH_HEAD"]);
  try {
    const result = await syncUpstream({ repo: work, api, fetchUrl: `${upstreamUrl}.git` });
    console.log(JSON.stringify(result));
  } finally {
    git(ROOT, ["worktree", "remove", "--force", work]);
    await rm(join(work, ".."), { recursive: true, force: true });
  }
});
