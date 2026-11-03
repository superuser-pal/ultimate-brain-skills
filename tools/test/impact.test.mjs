import assert from "node:assert/strict";
import { test } from "node:test";

import { impactProblem, parseDeclaration } from "../lib/impact.mjs";

const LINK = "Product: https://github.com/owner/ultimate-brain/issues/12";
const skillChange = ["brain/brain-apply/SKILL.md"];
const check = (body, changed = [], cliChanged = false) => impactProblem({ body, changed, cliChanged });

test("each value passes when it holds", () => {
  assert.equal(check("## What\n\nBrain impact: none\n", ["README.md"]), null);
  assert.equal(check("Brain impact: compatible", skillChange), null);
  assert.equal(check(`Brain impact: coordinated\n${LINK}`, ["snapshot.config.json"], true), null);
  assert.equal(check("Brain impact: coordinated\nProduct: https://github.com/owner/ultimate-brain/pull/7", []), null);
});

test("none fails on an operational change, including renames out of brain/ and deletions", () => {
  assert.match(check("Brain impact: none", skillChange), /declared none/);
  assert.match(check("Brain impact: none", ["snapshot.config.json"]), /declared none/);
  assert.match(check("Brain impact: none", ["brain/brain-old/SKILL.md", "skills/misc/brain-old/SKILL.md"]), /brain\/brain-old/);
});

test("compatible fails without an operational change, or when the CLI range changed", () => {
  assert.match(check("Brain impact: compatible", ["README.md"]), /declare none/);
  assert.match(check("Brain impact: compatible", ["snapshot.config.json"], true), /CLI range/);
});

test("coordinated fails without a Product: link of the right form", () => {
  assert.match(check("Brain impact: coordinated", skillChange), /without a `Product:/);
  assert.match(check("Brain impact: coordinated\nProduct: https://github.com/owner/other-repo/issues/1", skillChange), /without a `Product:/);
  assert.match(check("Brain impact: coordinated\nProduct: https://github.com/owner/ultimate-brain/issues/1 extra", skillChange), /without a `Product:/);
});

test("a missing, repeated or unknown declaration fails", () => {
  assert.match(check("", []), /no `Brain impact:` line/);
  assert.match(check(null, []), /no `Brain impact:` line/);
  assert.match(check("Brain impact: none\nBrain impact: none", []), /more than one/);
  assert.match(check("Brain impact: unassessed", []), /not one of/);
  assert.match(check("Brain impact: None", []), /not one of/);
  assert.match(check("Brain impact:  none", []), /not one of/);
  assert.match(check("> Brain impact: none", []), /no `Brain impact:` line/);
});

test("CRLF bodies and trailing whitespace are normalised", () => {
  assert.equal(check("## What\r\n\r\nBrain impact: none   \r\n", ["README.md"]), null);
  assert.deepEqual(parseDeclaration(`Brain impact: coordinated\r\n${LINK}\t\r\n`), { value: "coordinated", links: ["https://github.com/owner/ultimate-brain/issues/12"] });
});

test("options inside an HTML comment or a fenced block are ignored", () => {
  const template = "<!--\nKeep one line:\n  Brain impact: none\nBrain impact: compatible\n-->\n";
  assert.match(check(template, []), /no `Brain impact:` line/);
  assert.equal(check(`${template}Brain impact: none`, []), null);
  assert.match(check("<!-- Brain impact: none -->", []), /no `Brain impact:` line/);
  assert.equal(check("Brain impact: none\n<!-- unclosed\nBrain impact: none", []), null);
  assert.match(check("<!-- hidden\nBrain impact: none", []), /no `Brain impact:` line/);
  assert.equal(check("```\nBrain impact: compatible\n```\nBrain impact: none", []), null);
  assert.equal(check("   ~~~~\nBrain impact: compatible\n~~~\nstill fenced\n~~~~\nBrain impact: none", []), null);
  assert.match(check("```text\nBrain impact: none", []), /no `Brain impact:` line/);
  assert.equal(check("    ```\nnot a fence (four spaces)\nBrain impact: none", []), null);
  assert.deepEqual(parseDeclaration(`Brain impact: coordinated\n\`\`\`\n${LINK}\n\`\`\``), { value: "coordinated", links: [] });
});
