#!/usr/bin/env node
/**
 * The `leak` check (spec/skills-delivery.md §10.1): a copy of Ultimate Brain's scripts/leak-check.mjs with this fork's
 * allowlist, tools/leak-allow.txt. Flags UUID-like ids and email addresses (other than *.example) in tracked files, and with
 * --staged also the terms of the local denylist ~/.config/ultimate-brain/denylist.
 *
 *   node tools/leak-check.mjs [--staged]
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

import { ROOT } from "./lib/cli.mjs";

const UUID = /\b(?:[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}|[0-9a-f]{32})\b/gi;
const EMAIL = /\b[A-Z0-9._%+-]+@([A-Z0-9-]+(?:\.[A-Z0-9-]+)*\.[A-Z]{2,}|example)\b/gi;
const ALLOWLIST = "tools/leak-allow.txt";
const staged = process.argv.slice(2).join(" ") === "--staged";
const command = (args) => String(execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));

if (process.argv.length > 3 || (process.argv.length === 3 && !staged)) {
  process.stderr.write("Usage: node tools/leak-check.mjs [--staged]\n");
  process.exitCode = 1;
} else {
  const allow = readAllowlist();
  const denied = staged ? readDenylist() : [];
  const findings = [];
  for (const path of filesToScan()) findings.push(...scan(path, allow, denied));
  for (const finding of findings) process.stderr.write(`${finding.path}:${finding.line}: ${finding.rule}\n`);
  if (findings.length > 0) process.exitCode = 1;
  else console.log("leak check OK");
}

function filesToScan() {
  const args = staged ? ["diff", "--cached", "--name-only", "-z", "--diff-filter=ACMR"] : ["ls-files", "-z"];
  return command(args).split("\0").filter((path) => path !== "" && path !== ALLOWLIST && !path.split("/").includes("node_modules"));
}

function scan(path, allow, denied) {
  const content = staged ? command(["show", `:${path}`]) : readFileSync(resolve(ROOT, path), "utf8");
  if (content.includes("\0")) return [];
  const findings = [];
  for (const [index, line] of content.split(/\r?\n/).entries()) {
    UUID.lastIndex = 0;
    if (UUID.test(line) && !allowed(path, line, allow)) findings.push({ path, line: index + 1, rule: "UUID" });
    const hasNonExampleEmail = [...line.matchAll(EMAIL)].some((email) => !email[1].toLowerCase().endsWith(".example") && email[1].toLowerCase() !== "example");
    if (hasNonExampleEmail && !allowed(path, line, allow)) findings.push({ path, line: index + 1, rule: "EMAIL" });
    if (denied.some((term) => wholeWord(line, term)) && !allowed(path, line, allow)) findings.push({ path, line: index + 1, rule: "DENYLIST" });
  }
  return findings;
}

function readAllowlist() {
  const path = resolve(ROOT, ALLOWLIST);
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8").split(/\r?\n/).flatMap((line) => {
    if (line === "" || line.startsWith("#")) return [];
    const colon = line.indexOf(":");
    if (colon === -1) throw new Error(`Invalid leak allowlist entry: ${line}`);
    return [{ path: line.slice(0, colon), pattern: new RegExp(line.slice(colon + 1), "i") }];
  });
}

function readDenylist() {
  const path = resolve(process.env.HOME ?? homedir(), ".config/ultimate-brain/denylist");
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8").split(/\r?\n/).filter((line) => line !== "" && !line.startsWith("#"));
}

function allowed(path, line, allow) {
  return allow.some((entry) => entry.path === path && entry.pattern.test(line));
}

function wholeWord(line, term) {
  return new RegExp(`(^|[^\\p{L}\\p{N}_])${escapeRegExp(term)}($|[^\\p{L}\\p{N}_])`, "iu").test(line);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
