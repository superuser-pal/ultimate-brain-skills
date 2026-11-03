#!/usr/bin/env node
/** The `names` check (spec/skills-delivery.md §10.3 item 2): no general skill uses an operational skill's name. */
import { ROOT, run } from "./lib/cli.mjs";
import { git } from "./lib/git.mjs";
import { nameClashes } from "./lib/skills.mjs";

await run(async () => {
  const files = git(ROOT, ["ls-files", "-z", "--", "*SKILL.md"]).split("\0").filter((path) => path.endsWith("/SKILL.md") || path === "SKILL.md");
  const clashes = await nameClashes(ROOT, files);
  for (const clash of clashes) process.stderr.write(`error: ${clash}\n`);
  if (clashes.length > 0) throw new Error("rename the operational skill in a coordinated PR, or drop the general skill");
  console.log(`names OK: ${files.filter((path) => !path.startsWith("brain/")).length} general skills, none named like an operational skill`);
});
