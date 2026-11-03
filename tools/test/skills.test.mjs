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
