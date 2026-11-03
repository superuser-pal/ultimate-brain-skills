#!/usr/bin/env node
/** The `skills` check (spec/skills-delivery.md §10.3 item 1): the product's skill rules on every folder in brain/. */
import { join } from "node:path";

import { ROOT, run } from "./lib/cli.mjs";
import { folders, validateSkills } from "./lib/skills.mjs";

await run(async () => {
  const problems = await validateSkills(join(ROOT, "brain"));
  for (const problem of problems) process.stderr.write(`error: ${problem}\n`);
  if (problems.length > 0) throw new Error(`${problems.length} problem(s) in brain/`);
  console.log(`skills OK: ${(await folders(join(ROOT, "brain"))).length} operational skills`);
});
