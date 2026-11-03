// Synthetic Git repositories for the tooling tests. Nothing here touches the network or this checkout.
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { git } from "../lib/git.mjs";

const IDENTITY = { GIT_AUTHOR_NAME: "Test", GIT_AUTHOR_EMAIL: "test@x.example", GIT_COMMITTER_NAME: "Test", GIT_COMMITTER_EMAIL: "test@x.example" };
// Every git the tests start, the code under test's included, ignores the user's and the system's git config.
Object.assign(process.env, { GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" });
export const env = { ...process.env, ...IDENTITY };
export const run = (repo, args) => git(repo, args, { env });

export const UPSTREAM_COMMIT = "a".repeat(40);

export function tempDir(t, prefix = "ubs-test-") {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

/** Write `files` (path → text, or `{ symlink: target }`) into `root`. */
export function write(root, files) {
  for (const [path, content] of Object.entries(files)) {
    const full = join(root, ...path.split("/"));
    mkdirSync(dirname(full), { recursive: true });
    rmSync(full, { force: true });
    if (typeof content === "object" && content !== null && "symlink" in content) symlinkSync(content.symlink, full);
    else writeFileSync(full, content);
  }
}

export function initRepo(dir, { bare = false } = {}) {
  mkdirSync(dir, { recursive: true });
  run(dir, ["init", "--quiet", "--initial-branch=main", ...(bare ? ["--bare"] : [])]);
  return dir;
}

export function commit(repo, files, message = "change") {
  write(repo, files);
  run(repo, ["add", "-A"]);
  run(repo, ["commit", "--quiet", "--allow-empty", "-m", message]);
  return run(repo, ["rev-parse", "HEAD"]).trim();
}

export const skill = (name, body = "Do the thing.\n") => `---\nname: ${name}\ndescription: A synthetic skill named ${name}.\n---\n\n${body}`;

/** The files of a minimal fork: two operational skills, one linked; the upstream base recorded. */
export function forkFiles({ upstreamCommit = UPSTREAM_COMMIT, cli = ">=0.9.0 <0.10.0" } = {}) {
  return {
    LICENSE: "MIT License\n\nCopyright (c) 2026 Upstream Author\n",
    "NOTICE.md": "# Notice\n",
    "upstream.json": `${JSON.stringify({ repository: "https://github.com/upstream-owner/skills", commit: upstreamCommit }, null, 2)}\n`,
    "snapshot.config.json": `${JSON.stringify({ cli, linked_repo: ["brain-query"] }, null, 2)}\n`,
    "brain/brain-apply/SKILL.md": skill("brain-apply"),
    "brain/brain-apply/references/review-items.md": "# Review items\n",
    "brain/brain-query/SKILL.md": skill("brain-query"),
  };
}
