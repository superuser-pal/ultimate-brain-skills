// Upstream-change detection (spec/skills-delivery.md §10.5): one reviewable update PR on the branch `upstream-sync`,
// or one issue when the merge conflicts or upstream history was rewritten. Nothing here ever merges a PR.
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { git, gitOk } from "./git.mjs";

export const BRANCH = "upstream-sync";
export const LABEL = "upstream-sync";
/** Marks a PR the workflow closed, so a later run may open a new one for the same head (§10.5 step 5). */
export const CLOSED_MARKER = "<!-- upstream-sync: closed-by-workflow -->";
const LOG_LIMIT = 50;
const IDENTITY = ["-c", "user.name=upstream-sync", "-c", "user.email=upstream-sync@users.noreply.github.com"];

const short = (sha) => sha.slice(0, 7);
export const pullTitle = (head) => `Upstream sync to ${short(head)}`;
export const issueTitle = (head) => `Upstream sync conflict at ${short(head)}`;

/** The PR body: what it merges, upstream's commits (at most 50 lines), and `Brain impact: unassessed` last. */
export function pullBody({ repository, base, head, log }) {
  const lines = log.length > LOG_LIMIT ? [...log.slice(0, LOG_LIMIT), `…and ${log.length - LOG_LIMIT} more`] : log;
  return [
    `Merges upstream ${repository} from \`${short(base)}\` to \`${short(head)}\` into main, and sets upstream.json to the new head. Opened by the upstream-sync workflow, which never merges.`,
    "",
    "Before merging: assess what these commits change for the brain, replace the last line with `Brain impact: none`, `compatible` or `coordinated` (with a `Product:` link), and merge with a merge commit.",
    "",
    "Upstream commits:",
    "",
    "```text",
    ...lines,
    "```",
    "",
    "Brain impact: unassessed",
  ].join("\n");
}

/**
 * One run. `repo` is a clone of the fork whose `origin` is the fork; `fetchUrl` is where upstream's history is fetched
 * from; `api` is the GitHub seam (see github.mjs). Returns `{ outcome, … }` for the log and the tests.
 */
export async function syncUpstream({ repo, api, fetchUrl }) {
  git(repo, ["fetch", "--quiet", "--no-tags", "origin", "main"]);
  const main = git(repo, ["rev-parse", "FETCH_HEAD"]).trim();
  const recorded = JSON.parse(git(repo, ["show", `${main}:upstream.json`]));
  const { branch, sha: head } = await api.upstreamHead(recorded.repository);

  // Step 2: up to date. A hand-resolved merge also lands here, and closes the issue.
  git(repo, ["fetch", "--quiet", "--no-tags", fetchUrl, `refs/heads/${branch}`]);
  if (!gitOk(repo, ["cat-file", "-e", `${head}^{commit}`])) throw new Error(`upstream's ${branch} moved during the run; run again`);
  if (head === recorded.commit || gitOk(repo, ["merge-base", "--is-ancestor", head, main])) {
    await closeIssue(api, head, "is merged into main");
    return { outcome: "up-to-date", head };
  }

  // Step 3: rewritten history.
  if (!gitOk(repo, ["merge-base", "--is-ancestor", recorded.commit, head])) {
    const issue = await openIssue(api, head, `Upstream history was rewritten: the recorded base \`${recorded.commit}\` is not an ancestor of upstream's head \`${head}\`. Merge by hand (see the fork's NOTICE.md), or wait for upstream.`, []);
    return { outcome: "rewritten", head, issue };
  }

  // Step 4: rebuild the branch unless its merge already joins this main and this head.
  const remoteBranch = git(repo, ["ls-remote", "--heads", "origin", BRANCH]).trim();
  let current = false;
  if (remoteBranch !== "") {
    git(repo, ["fetch", "--quiet", "--no-tags", "origin", BRANCH]);
    const parents = git(repo, ["rev-list", "--parents", "-n", "1", "FETCH_HEAD~1"]).trim().split(" ").slice(1);
    current = parents.length === 2 && parents[0] === main && parents[1] === head;
  }
  if (!current) {
    const conflicts = mergeUpstream(repo, { main, head, repository: recorded.repository });
    if (conflicts.length > 0) {
      // Step 6: push nothing, close the open sync PR, report in the issue.
      const issue = await openIssue(api, head, `Merging upstream \`${head}\` into main (\`${main}\`) conflicts.`, conflicts);
      for (const pull of await api.openPulls(BRANCH)) {
        await api.comment(pull.number, `Closed by the upstream-sync workflow: merging upstream \`${short(head)}\` conflicts. See #${issue}.\n\n${CLOSED_MARKER}`);
        await api.closePull(pull.number);
      }
      return { outcome: "conflict", head, issue, conflicts };
    }
    git(repo, ["push", "--quiet", "--force", "origin", `HEAD:refs/heads/${BRANCH}`]);
  }

  // Step 5: one PR.
  const title = pullTitle(head);
  const log = git(repo, ["log", "--oneline", "--no-decorate", `${recorded.commit}..${head}`]).split("\n").filter(Boolean);
  const body = pullBody({ repository: recorded.repository, base: recorded.commit, head, log });
  let result;
  const [open] = await api.openPulls(BRANCH);
  if (open !== undefined) {
    if (open.title === title) result = { outcome: "unchanged", head, pull: open.number };
    else {
      await api.updatePull(open.number, { title, body });
      result = { outcome: "updated", head, pull: open.number };
    }
  } else if (await declinedByPerson(api, title)) {
    result = { outcome: "declined", head };
  } else {
    result = { outcome: "opened", head, pull: await api.createPull({ title, body, head: BRANCH, base: "main" }) };
  }
  await closeIssue(api, head, "merges cleanly");
  return result;
}

/** Merge `head` into `main` on a detached HEAD with the fork's .github/, then record it in upstream.json; the conflicting paths, or []. */
function mergeUpstream(repo, { main, head, repository }) {
  git(repo, ["checkout", "--quiet", "--force", "--detach", main]);
  git(repo, ["clean", "--quiet", "-fdx", "--exclude=tools/node_modules"]);
  gitOk(repo, [...IDENTITY, "merge", "--quiet", "--no-ff", "--no-commit", head]);
  // .github/** always resolves to the fork's version, so upstream workflows never run in the fork.
  git(repo, ["rm", "-r", "-q", "-f", "--ignore-unmatch", "--", ".github"]);
  if (git(repo, ["ls-tree", "--name-only", main, ".github"]).trim() !== "") git(repo, ["checkout", main, "--", ".github"]);
  const conflicts = git(repo, ["diff", "--name-only", "--diff-filter=U"]).split("\n").filter(Boolean);
  if (conflicts.length > 0) {
    git(repo, ["merge", "--abort"]);
    return conflicts;
  }
  git(repo, [...IDENTITY, "commit", "--quiet", "--no-verify", "-m", `Merge upstream ${short(head)} into main`]);
  writeFileSync(join(repo, "upstream.json"), `${JSON.stringify({ repository, commit: head }, null, 2)}\n`);
  git(repo, ["add", "upstream.json"]);
  git(repo, [...IDENTITY, "commit", "--quiet", "--no-verify", "-m", `Set upstream.json to ${short(head)}`]);
  return [];
}

/** Whether a person closed a sync PR for this head without merging it (a PR the workflow closed doesn't count). */
async function declinedByPerson(api, title) {
  for (const pull of await api.closedPulls(BRANCH)) {
    if (pull.title !== title || pull.merged) continue;
    const comments = await api.comments(pull.number);
    if (!comments.some((comment) => comment.includes(CLOSED_MARKER))) return true;
  }
  return false;
}

/** Open or update the one `upstream-sync` issue (§10.5 step 7); its number. */
async function openIssue(api, head, reason, paths) {
  await api.ensureLabel(LABEL);
  const body = [reason, "", ...(paths.length > 0 ? ["Conflicting paths:", "", ...paths.map((path) => `- \`${path}\``), ""] : []), "Resolve it by hand on another branch: merge the upstream head, resolve, set upstream.json, and open a PR declaring its brain impact. The workflow closes this issue once that is merged."].join("\n");
  const [open] = await api.openIssues(LABEL);
  if (open !== undefined) {
    await api.updateIssue(open.number, { title: issueTitle(head), body });
    return open.number;
  }
  return api.createIssue({ title: issueTitle(head), body, labels: [LABEL] });
}

async function closeIssue(api, head, why) {
  for (const issue of await api.openIssues(LABEL)) {
    await api.comment(issue.number, `Upstream \`${short(head)}\` ${why}; closing.`);
    await api.closeIssue(issue.number);
  }
}
