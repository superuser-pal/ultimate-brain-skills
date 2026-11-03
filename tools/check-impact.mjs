#!/usr/bin/env node
/**
 * The `impact` check (spec/skills-delivery.md §10.4) on a PR.
 *
 *   PR_BODY=… node tools/check-impact.mjs --base <base tip> --head <PR head>
 *
 * The diff is three-dot (merge base to head), renames and deletions included.
 */
import { ROOT, parseArgs, run } from "./lib/cli.mjs";
import { git } from "./lib/git.mjs";
import { impactProblem } from "./lib/impact.mjs";

function cliAt(commit) {
  try {
    return JSON.parse(git(ROOT, ["show", `${commit}:snapshot.config.json`])).cli;
  } catch {
    return undefined;
  }
}

await run(async () => {
  const args = parseArgs(process.argv.slice(2));
  if (typeof args.base !== "string" || typeof args.head !== "string") throw new Error("usage: check-impact.mjs --base <sha> --head <sha> (body in PR_BODY)");
  const base = git(ROOT, ["merge-base", args.base, args.head]).trim();
  const changed = git(ROOT, ["diff", "--name-only", "--no-renames", "-z", base, args.head]).split("\0").filter(Boolean);
  const problem = impactProblem({ body: process.env.PR_BODY ?? "", changed, cliChanged: cliAt(base) !== cliAt(args.head) });
  if (problem !== null) throw new Error(`impact: ${problem}`);
  console.log("impact OK");
});
