// §12.2 item 4: the upstream sync against a test upstream, with an in-memory GitHub. Nothing ever merges.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";

import { impactProblem } from "../lib/impact.mjs";
import { BRANCH, CLOSED_MARKER, LABEL, syncUpstream } from "../lib/sync.mjs";
import { commit, initRepo, run, tempDir } from "./helpers.mjs";

/** The GitHub seam, in memory. It has no merge operation: the sync can't merge. */
function fakeGitHub(upstream) {
  let next = 1;
  const state = { pulls: [], issues: [], comments: new Map(), labels: new Set() };
  const api = {
    state,
    upstreamHead: async () => ({ branch: "main", sha: run(upstream, ["rev-parse", "main"]).trim() }),
    openPulls: async (head) => state.pulls.filter((p) => p.head === head && p.state === "open").map(({ number, title }) => ({ number, title })),
    closedPulls: async (head) => state.pulls.filter((p) => p.head === head && p.state === "closed").map(({ number, title, merged }) => ({ number, title, merged })),
    comments: async (number) => state.comments.get(number) ?? [],
    createPull: async ({ title, body, head, base }) => {
      state.pulls.push({ number: next, title, body, head, base, state: "open", merged: false });
      return next++;
    },
    updatePull: async (number, fields) => Object.assign(state.pulls.find((p) => p.number === number), fields),
    closePull: async (number) => { state.pulls.find((p) => p.number === number).state = "closed"; },
    comment: async (number, body) => state.comments.set(number, [...(state.comments.get(number) ?? []), body]),
    ensureLabel: async (name) => state.labels.add(name),
    openIssues: async (label) => state.issues.filter((i) => i.state === "open" && i.labels.includes(label)).map(({ number, title }) => ({ number, title })),
    createIssue: async ({ title, body, labels }) => {
      state.issues.push({ number: next, title, body, labels, state: "open" });
      return next++;
    },
    updateIssue: async (number, fields) => Object.assign(state.issues.find((i) => i.number === number), fields),
    closeIssue: async (number) => { state.issues.find((i) => i.number === number).state = "closed"; },
  };
  return api;
}

/** An upstream with a skill and a workflow; a fork of it with its own .github/ and upstream.json; a clone the sync runs in. */
function setup(t) {
  const dir = tempDir(t, "ubs-sync-");
  const upstream = initRepo(join(dir, "upstream"));
  const base = commit(upstream, { "README.md": "line one\nline two\n", "skills/misc/tdd/SKILL.md": "---\nname: tdd\ndescription: x\n---\n\nTest first.\n", ".github/workflows/release.yml": "upstream release\n" }, "upstream: first");
  const origin = initRepo(join(dir, "origin.git"), { bare: true });
  const author = join(dir, "author");
  run(dir, ["clone", "--quiet", upstream, author]);
  run(author, ["remote", "set-url", "origin", origin]);
  run(author, ["rm", "-q", "-r", ".github"]);
  commit(author, {
    "upstream.json": `${JSON.stringify({ repository: "https://github.com/upstream-owner/skills", commit: base }, null, 2)}\n`,
    ".github/workflows/ci.yml": "fork ci\n",
    "brain/brain-query/SKILL.md": "---\nname: brain-query\ndescription: x\n---\n\nAsk.\n",
  }, "fork: bootstrap");
  run(author, ["push", "--quiet", "origin", "main"]);
  const clone = join(dir, "clone");
  run(dir, ["clone", "--quiet", origin, clone]);
  const api = fakeGitHub(upstream);
  const sync = () => syncUpstream({ repo: clone, api, fetchUrl: upstream });
  const mainOf = () => run(origin, ["rev-parse", "main"]).trim();
  return { upstream, origin, author, api, sync, mainOf, base };
}

const short = (sha) => sha.slice(0, 7);
const openPulls = (api) => api.state.pulls.filter((p) => p.state === "open");
const openIssues = (api) => api.state.issues.filter((i) => i.state === "open");

test("no upstream change: nothing opens", async (t) => {
  const { api, sync } = setup(t);
  assert.equal((await sync()).outcome, "up-to-date");
  assert.equal(api.state.pulls.length + api.state.issues.length, 0);
});

test("a new upstream commit opens one PR marked unassessed, and nothing merges", async (t) => {
  const { upstream, origin, api, sync, mainOf, base } = setup(t);
  const main = mainOf();
  const head = commit(upstream, { "README.md": "line one\nline two\nline three\n", ".github/workflows/release.yml": "upstream release v2\n", ".github/workflows/new.yml": "new upstream workflow\n" }, "upstream: second");

  const result = await sync();
  assert.equal(result.outcome, "opened");
  assert.equal(api.state.pulls.length, 1);
  const [pull] = api.state.pulls;
  assert.equal(pull.title, `Upstream sync to ${short(head)}`);
  assert.equal(pull.head, BRANCH);
  assert.equal(pull.base, "main");
  assert.ok(pull.body.endsWith("\nBrain impact: unassessed"));
  assert.match(pull.body, new RegExp(`${short(head)} upstream: second`));
  assert.match(impactProblem({ body: pull.body, changed: ["README.md"], cliChanged: false }), /not one of/, "the impact check fails until someone assesses it");

  // The branch: a --no-ff merge of main and the upstream head, then upstream.json; the fork's .github/ kept.
  const tip = run(origin, ["rev-parse", BRANCH]).trim();
  assert.deepEqual(run(origin, ["rev-list", "--parents", "-n", "1", `${BRANCH}~1`]).trim().split(" ").slice(1), [main, head]);
  assert.equal(JSON.parse(run(origin, ["show", `${tip}:upstream.json`])).commit, head);
  assert.equal(run(origin, ["show", `${tip}:README.md`]), "line one\nline two\nline three\n");
  assert.equal(run(origin, ["ls-tree", "-r", "--name-only", tip, ".github"]).trim(), ".github/workflows/ci.yml");
  assert.notEqual(base, head);

  assert.equal(mainOf(), main, "main never moves");
});

test("a second run with the same head leaves the body alone; a newer head updates the one PR", async (t) => {
  const { upstream, origin, api, sync, mainOf } = setup(t);
  const main = mainOf();
  commit(upstream, { "README.md": "line one\nline two\nline three\n" }, "upstream: second");
  await sync();
  const [pull] = api.state.pulls;
  pull.body = pull.body.replace("Brain impact: unassessed", "Brain impact: none");
  const tip = run(origin, ["rev-parse", BRANCH]).trim();

  assert.equal((await sync()).outcome, "unchanged");
  assert.ok(pull.body.endsWith("Brain impact: none"), "an assessment already written stays");
  assert.equal(run(origin, ["rev-parse", BRANCH]).trim(), tip, "a current branch isn't rebuilt");

  const newer = commit(upstream, { "skills/misc/tdd/SKILL.md": "---\nname: tdd\ndescription: x\n---\n\nTest first, always.\n" }, "upstream: third");
  assert.equal((await sync()).outcome, "updated");
  assert.equal(api.state.pulls.length, 1);
  assert.equal(pull.title, `Upstream sync to ${short(newer)}`);
  assert.ok(pull.body.endsWith("Brain impact: unassessed"));
  assert.equal(JSON.parse(run(origin, [`show`, `${BRANCH}:upstream.json`])).commit, newer);
  assert.equal(mainOf(), main);
});

test("a PR a person closed for the same head isn't reopened", async (t) => {
  const { upstream, api, sync } = setup(t);
  commit(upstream, { "README.md": "line one\nline two\nline three\n" }, "upstream: second");
  await sync();
  api.state.pulls[0].state = "closed";
  assert.equal((await sync()).outcome, "declined");
  assert.equal(openPulls(api).length, 0);
});

test("a conflict closes the PR, pushes nothing and opens one issue; resolving by hand closes it", async (t) => {
  const { upstream, origin, author, api, sync, mainOf } = setup(t);
  commit(upstream, { "skills/misc/tdd/SKILL.md": "---\nname: tdd\ndescription: x\n---\n\nTest first, again.\n" }, "upstream: second");
  await sync();
  const branchBefore = run(origin, ["rev-parse", BRANCH]).trim();

  // The fork changes a line upstream then changes too.
  commit(author, { "README.md": "line one (fork)\nline two\n" }, "fork: edit readme");
  run(author, ["push", "--quiet", "origin", "main"]);
  const main = mainOf();
  const head = commit(upstream, { "README.md": "line one (upstream)\nline two\n" }, "upstream: edit readme");

  const result = await sync();
  assert.equal(result.outcome, "conflict");
  assert.deepEqual(result.conflicts, ["README.md"]);
  assert.equal(openPulls(api).length, 0, "the open sync PR is closed");
  assert.ok(api.state.comments.get(1).at(-1).includes(CLOSED_MARKER));
  assert.equal(run(origin, ["rev-parse", BRANCH]).trim(), branchBefore, "nothing is pushed");
  assert.equal(openIssues(api).length, 1);
  const [issue] = openIssues(api);
  assert.equal(issue.title, `Upstream sync conflict at ${short(head)}`);
  assert.deepEqual(issue.labels, [LABEL]);
  assert.ok(api.state.labels.has(LABEL));
  assert.match(issue.body, /- `README\.md`/);

  assert.equal((await sync()).outcome, "conflict");
  assert.equal(api.state.issues.length, 1, "the same issue is updated, never a second");
  assert.equal(mainOf(), main);

  // Resolved by hand on another branch and merged: the head is now an ancestor of main.
  run(author, ["fetch", "--quiet", upstream, "main"]);
  try {
    run(author, ["merge", "--quiet", "--no-ff", "FETCH_HEAD"]);
  } catch {
    commit(author, { "README.md": "line one (both)\nline two\n" }, "resolve");
  }
  commit(author, { "upstream.json": `${JSON.stringify({ repository: "https://github.com/upstream-owner/skills", commit: head }, null, 2)}\n` }, "set upstream.json");
  run(author, ["push", "--quiet", "origin", "main"]);
  assert.equal((await sync()).outcome, "up-to-date");
  assert.equal(openIssues(api).length, 0, "the issue is closed with a comment");
  assert.match(api.state.comments.get(issue.number).at(-1), /closing/);
});

test("after a conflict the workflow closed, a clean merge of the same head opens a new PR and closes the issue", async (t) => {
  const { upstream, author, api, sync } = setup(t);
  commit(author, { "README.md": "line one (fork)\nline two\n" }, "fork: edit readme");
  run(author, ["push", "--quiet", "origin", "main"]);
  commit(upstream, { "README.md": "line one\nline two\nline three\n" }, "upstream: append");
  await sync();
  assert.equal(openPulls(api).length, 1, "a non-overlapping change merges");
  const head = commit(upstream, { "README.md": "line one (upstream)\nline two\nline three\n" }, "upstream: edit readme");
  assert.equal((await sync()).outcome, "conflict");

  commit(author, { "README.md": "line one\nline two\n" }, "fork: revert readme");
  run(author, ["push", "--quiet", "origin", "main"]);
  const result = await sync();
  assert.equal(result.outcome, "opened");
  assert.equal(openPulls(api).length, 1);
  assert.equal(openPulls(api)[0].title, `Upstream sync to ${short(head)}`);
  assert.equal(openIssues(api).length, 0);
});

test("rewritten upstream history opens the issue and no PR", async (t) => {
  const { upstream, api, sync, mainOf } = setup(t);
  const main = mainOf();
  run(upstream, ["checkout", "--quiet", "--orphan", "rewritten"]);
  const head = commit(upstream, { "README.md": "rewritten\n" }, "upstream: rewritten root");
  run(upstream, ["branch", "-q", "-f", "main", head]);

  const result = await sync();
  assert.equal(result.outcome, "rewritten");
  assert.equal(api.state.pulls.length, 0);
  assert.equal(openIssues(api).length, 1);
  assert.match(openIssues(api)[0].title, new RegExp(short(head)));
  assert.match(api.state.issues[0].body, /history was rewritten/);
  assert.equal(mainOf(), main);
});
