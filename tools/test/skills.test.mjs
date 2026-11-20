import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";

import { nameClashes, validateSkills } from "../lib/skills.mjs";
import { skill, tempDir, write } from "./helpers.mjs";

test("the skills check applies the product's rules to brain/", async (t) => {
  const root = tempDir(t);
  write(root, {
    "brain/brain-ok/SKILL.md": skill("brain-ok", "Use `CAPS` in code only. See [the guide](references/guide.md).\n"),
    "brain/brain-ok/references/guide.md": "Guide. See [deep](deep.md).\n",
    "brain/brain-ok/references/deep.md": "Deep.\n",
    "brain/brain-wrong/SKILL.md": skill("brain-other", "Always do it. NEVER skip.\n"),
    "brain/brain-extra/SKILL.md": "---\nname: brain-extra\ndescription: x\nversion: 1\n---\n\nBody.\n",
    "brain/brain-none/notes.md": "no skill\n",
  });
  const problems = await validateSkills(join(root, "brain"));
  assert.deepEqual(problems, [
    "brain/brain-extra/SKILL.md: frontmatter may only have name and description, found version",
    "brain/brain-none/SKILL.md: missing",
    "brain/brain-ok/references/guide.md: links to references/deep.md, which SKILL.md doesn't link to (references are one level deep)",
    'brain/brain-wrong/SKILL.md: name must be "brain-wrong" (the folder name)',
    "brain/brain-wrong/SKILL.md: capitals for emphasis (NEVER); write it plainly, or put code in backticks",
  ]);
});

test("the skills check fails a description over 900 characters or with a <…> placeholder", async (t) => {
  const root = tempDir(t);
  const front = (name, description) => `---\nname: ${name}\ndescription: ${description}\n---\n\nBody.\n`;
  write(root, {
    "brain/brain-long/SKILL.md": front("brain-long", "a".repeat(901)),
    "brain/brain-edge/SKILL.md": front("brain-edge", "a".repeat(900)),
    "brain/brain-tag/SKILL.md": front("brain-tag", 'Use when the user says "ingest this page <url>".'),
    "brain/brain-less/SKILL.md": front("brain-less", "Use when the count is 3 < 5 or a < b fails."),
  });
  assert.deepEqual(await validateSkills(join(root, "brain")), [
    "brain/brain-long/SKILL.md: description is over 900 characters (901)",
    "brain/brain-tag/SKILL.md: description has a <…> placeholder; write it in words",
  ]);
});

test("the names check fails when a general skill's folder or frontmatter name is an operational skill's", async (t) => {
  const root = tempDir(t);
  write(root, {
    "brain/brain-query/SKILL.md": skill("brain-query"),
    "skills/misc/tdd/SKILL.md": skill("tdd"),
    "skills/misc/brain-query/SKILL.md": skill("brain-query-general"),
    "skills/other/asker/SKILL.md": skill("brain-query"),
  });
  const files = ["brain/brain-query/SKILL.md", "skills/misc/tdd/SKILL.md", "skills/misc/brain-query/SKILL.md", "skills/other/asker/SKILL.md"];
  assert.deepEqual(await nameClashes(root, files), [
    'skills/misc/brain-query/SKILL.md: general skill name "brain-query" is an operational skill\'s name',
    'skills/other/asker/SKILL.md: general skill name "brain-query" is an operational skill\'s name',
  ]);
  assert.deepEqual(await nameClashes(root, files.slice(0, 2)), []);
});
