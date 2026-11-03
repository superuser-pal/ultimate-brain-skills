// The `skills` and `names` checks (spec/skills-delivery.md §10.3). The skill rules copy the product's
// scripts/build-skills.ts: name = folder, only name and description, description ≤ 1024 characters, a non-empty body,
// references one level deep, no capitals for emphasis.
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

import { isMap, parseDocument } from "yaml";

const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** A Markdown file's YAML frontmatter mapping and body; throws on a missing or broken frontmatter. */
export function parseFrontmatter(source) {
  const opening = /^---(?:\r\n|\n)/.exec(source);
  if (opening === null) throw new Error("Markdown file must start with a YAML frontmatter delimiter");
  const afterOpening = source.slice(opening[0].length);
  const closing = /^---(?:\r\n|\n|$)/m.exec(afterOpening);
  if (closing === null) throw new Error("YAML frontmatter is missing its closing delimiter");
  const document = parseDocument(afterOpening.slice(0, closing.index), { schema: "core", prettyErrors: true, uniqueKeys: true });
  if (document.errors.length > 0) throw new Error(`Invalid YAML frontmatter: ${document.errors[0].message}`);
  if (document.contents !== null && !isMap(document.contents)) throw new Error("YAML frontmatter must contain a top-level mapping");
  return { attributes: document.contents === null ? {} : document.toJS(), body: afterOpening.slice(closing.index + closing[0].length) };
}

/** Folder names under `dir`, sorted, hidden ones skipped. */
export async function folders(dir) {
  try {
    return (await readdir(dir, { withFileTypes: true })).filter((entry) => entry.isDirectory() && !entry.name.startsWith(".")).map((entry) => entry.name).sort();
  } catch {
    return [];
  }
}

/** Problems with the operational skills in `brain` (the product's validateSkills, reported as brain/<name>/…). */
export async function validateSkills(brain) {
  const problems = [];
  for (const name of await folders(brain)) {
    const where = `brain/${name}/SKILL.md`;
    if (!NAME.test(name)) problems.push(`brain/${name}: folder name must be lowercase kebab-case`);
    let text;
    try {
      text = await readFile(join(brain, name, "SKILL.md"), "utf8");
    } catch {
      problems.push(`${where}: missing`);
      continue;
    }
    let attributes;
    let body;
    try {
      ({ attributes, body } = parseFrontmatter(text));
    } catch (error) {
      problems.push(`${where}: ${error.message}`);
      continue;
    }
    const extra = Object.keys(attributes).filter((key) => key !== "name" && key !== "description");
    if (extra.length > 0) problems.push(`${where}: frontmatter may only have name and description, found ${extra.join(", ")}`);
    if (attributes.name !== name) problems.push(`${where}: name must be "${name}" (the folder name)`);
    if (typeof attributes.description !== "string" || attributes.description.trim() === "") problems.push(`${where}: description is required`);
    else if (attributes.description.length > 1024) problems.push(`${where}: description is over 1024 characters`);
    if (body.trim() === "") problems.push(`${where}: body is empty`);
    problems.push(...(await textProblems(join(brain, name), body)));
  }
  return problems;
}

/** Words of four or more capitals allowed outside code: acronyms and file names, never emphasis (product CC-61). */
export const CAPS_ALLOWED = new Set(["AGENTS", "CHANGELOG", "HTML", "JSON", "NNNN", "README", "SKILL", "YYYY"]);
const CAPS = /\b[A-Z]{4,}\b/g;
const INLINE_LINK = /\]\(\s*<?([^)\s>]+)>?(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/g;
const LINK_DEFINITION = /^ {0,3}\[[^\]]+\]:\s*<?([^\s>]+)>?/gm;
const CODE_SPAN = /(?<!`)(`+)(?!`)[\s\S]*?(?<!`)\1(?!`)/g;

async function textProblems(dir, skillBody) {
  const problems = [];
  const name = dir.split(/[\\/]/).pop();
  const files = new Map([["SKILL.md", skillBody]]);
  for (const [path, content] of await allFiles(dir)) if (path !== "SKILL.md" && path.endsWith(".md")) files.set(path, content);
  const fromSkill = new Set(localLinks("SKILL.md", prose(skillBody)));
  for (const [path, content] of files) {
    const text = prose(content);
    for (const target of localLinks(path, text)) {
      if (target !== "SKILL.md" && !fromSkill.has(target) && (await exists(join(dir, target)))) {
        problems.push(`brain/${name}/${path}: links to ${target}, which SKILL.md doesn't link to (references are one level deep)`);
      }
    }
    const shouted = [...new Set([...text.matchAll(CAPS)].map((match) => match[0]).filter((word) => !CAPS_ALLOWED.has(word)))];
    if (shouted.length > 0) problems.push(`brain/${name}/${path}: capitals for emphasis (${shouted.join(", ")}); write it plainly, or put code in backticks`);
  }
  return problems;
}

/** Markdown with its code removed, as CommonMark reads code (a copy of the product's `prose`). */
export function prose(content) {
  const kept = [];
  let fence;
  let listIndent = 0;
  let previousBlank = true;
  let inIndentedCode = false;
  for (const line of content.split("\n")) {
    const indent = line.replace(/\t/g, "    ").search(/\S/);
    if (fence !== undefined) {
      const close = line.trimStart().match(/^(`+|~+)\s*$/);
      if (close !== null && close[1][0] === fence.char && close[1].length >= fence.length) fence = undefined;
      continue;
    }
    if (indent === -1) {
      kept.push("");
      previousBlank = true;
      continue;
    }
    if (inIndentedCode && indent >= listIndent + 4) continue;
    inIndentedCode = false;
    if (previousBlank && indent >= listIndent + 4) {
      inIndentedCode = true;
      continue;
    }
    const open = line.trimStart().match(/^(`{3,}|~{3,})/);
    if (open !== null && indent < listIndent + 4) {
      fence = { char: open[1][0], length: open[1].length };
      previousBlank = false;
      continue;
    }
    const item = line.match(/^(\s*)([-*+]|\d{1,9}[.)])(\s+)\S/);
    if (item !== null) listIndent = item[1].length + item[2].length + Math.min(item[3].length, 4);
    else if (previousBlank && indent < listIndent) listIndent = 0;
    kept.push(line);
    previousBlank = false;
  }
  return kept.join("\n").replace(CODE_SPAN, "");
}

function localLinks(from, content) {
  const base = from.includes("/") ? from.slice(0, from.lastIndexOf("/")) : "";
  const links = [];
  for (const [, href] of [...content.matchAll(INLINE_LINK), ...content.matchAll(LINK_DEFINITION)]) {
    const target = href.split("#")[0];
    if (target === "" || /^[a-z]+:/i.test(target) || target.startsWith("/")) continue;
    const parts = base === "" ? [] : base.split("/");
    for (const part of target.split("/")) {
      if (part === "..") parts.pop();
      else if (part !== ".") parts.push(part);
    }
    links.push(parts.join("/"));
  }
  return links;
}

async function exists(path) {
  try {
    await readFile(path);
    return true;
  } catch {
    return false;
  }
}

async function allFiles(root, dir = root, out = new Map()) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name === ".DS_Store") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await allFiles(root, path, out);
    else out.set(relative(root, path).split("\\").join("/"), await readFile(path, "utf8"));
  }
  return out;
}

/**
 * The `names` check: every folder outside brain/ holding a SKILL.md is a general skill; its folder name and its frontmatter
 * `name` must differ from every operational skill's. `skillFiles` are repo-relative SKILL.md paths (from `git ls-files`).
 */
export async function nameClashes(root, skillFiles) {
  const nameOf = async (path) => {
    try {
      const { attributes } = parseFrontmatter(await readFile(join(root, path), "utf8"));
      return typeof attributes.name === "string" ? attributes.name : undefined;
    } catch {
      return undefined;
    }
  };
  const operational = new Set();
  for (const name of await folders(join(root, "brain"))) {
    operational.add(name);
    const declared = await nameOf(`brain/${name}/SKILL.md`);
    if (declared !== undefined) operational.add(declared);
  }
  const clashes = [];
  for (const path of skillFiles.filter((file) => !file.startsWith("brain/")).sort()) {
    const folder = path.split("/").at(-2);
    if (folder === undefined) continue;
    const declared = await nameOf(path);
    for (const name of new Set([folder, declared].filter(Boolean))) {
      if (operational.has(name)) clashes.push(`${path}: general skill name "${name}" is an operational skill's name`);
    }
  }
  return clashes;
}
