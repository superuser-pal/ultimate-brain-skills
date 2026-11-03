import assert from "node:assert/strict";
import { mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { ROOT, loadSchema } from "../lib/cli.mjs";
import { buildSnapshot, integrity, manifestReason, serialise, validateSnapshot, writeSnapshot } from "../lib/snapshot.mjs";
import { commit, forkFiles, initRepo, run, tempDir } from "./helpers.mjs";

const schema = loadSchema();
const REPOSITORY = "https://github.com/example/ultimate-brain-skills";

function fork(t, files = forkFiles()) {
  const repo = initRepo(join(tempDir(t), "fork"));
  commit(repo, files, "fork");
  return repo;
}

async function built(t, repo, version = "1.0.0") {
  const out = join(tempDir(t), "snapshot");
  await writeSnapshot(buildSnapshot({ repo, commit: "HEAD", version, repository: REPOSITORY }), out);
  return out;
}

test("a build from Git validates against the vendored schema and §2.3, with the §2 manifest", async (t) => {
  const repo = fork(t);
  const out = await built(t, repo);
  assert.equal(await validateSnapshot(out, schema), null);
  const manifest = JSON.parse(readFileSync(join(out, "snapshot.json"), "utf8"));
  assert.deepEqual(Object.keys(manifest), ["format", "name", "version", "cli", "source", "upstream", "integrity", "skills"]);
  assert.equal(manifest.name, "ultimate-brain-skills");
  assert.equal(manifest.cli, ">=0.9.0 <0.10.0");
  assert.equal(manifest.source.commit, run(repo, ["rev-parse", "HEAD"]).trim());
  assert.deepEqual(manifest.upstream, { repository: "https://github.com/upstream-owner/skills", commit: "a".repeat(40) });
  assert.deepEqual(manifest.skills.map((skill) => [skill.name, skill.targets]), [["brain-apply", ["brain"]], ["brain-query", ["brain", "linked_repo"]]]);
  assert.deepEqual(manifest.skills[0].files.map((file) => file.path), ["SKILL.md", "references/review-items.md"]);
  assert.deepEqual(readdirSync(out).sort(), ["LICENSE", "NOTICE.md", "brain-apply", "brain-query", "snapshot.json"]);
});

test("building the same commit and version twice is byte-identical", async (t) => {
  const repo = fork(t);
  const [a, b] = [await built(t, repo), await built(t, repo)];
  assert.equal(readFileSync(join(a, "snapshot.json"), "utf8"), readFileSync(join(b, "snapshot.json"), "utf8"));
  assert.deepEqual(readFileSync(join(a, "brain-apply/SKILL.md")), readFileSync(join(b, "brain-apply/SKILL.md")));
});

test("the build reads Git, not the working tree", async (t) => {
  const repo = fork(t);
  writeFileSync(join(repo, "brain/brain-apply/SKILL.md"), "uncommitted\n");
  writeFileSync(join(repo, "brain/brain-apply/stray.md"), "untracked\n");
  const out = await built(t, repo);
  assert.equal(await validateSnapshot(out, schema), null);
  assert.notEqual(readFileSync(join(out, "brain-apply/SKILL.md"), "utf8"), "uncommitted\n");
});

test("a symbolic link, a file directly in brain/, a folder without SKILL.md or a missing linked skill fails the build", (t) => {
  const cases = [
    [{ "brain/brain-apply/link.md": { symlink: "SKILL.md" } }, /symbolic link/],
    [{ "brain/README.md": "# Brain\n" }, /only skill folders/],
    [{ "brain/brain-empty/notes.md": "no skill\n" }, /brain\/brain-empty: no SKILL\.md/],
    [{ "snapshot.config.json": JSON.stringify({ cli: ">=0.9.0", linked_repo: ["brain-missing"] }) }, /linked_repo names brain-missing/],
    [{ "snapshot.config.json": JSON.stringify({ cli: "^0.9.0", linked_repo: [] }) }, /range grammar/],
    [{ "snapshot.config.json": JSON.stringify({ cli: ">=0.9.0", linked_repo: [], extra: 1 }) }, /unknown keys/],
  ];
  for (const [files, error] of cases) {
    const repo = fork(t, { ...forkFiles(), ...files });
    assert.throws(() => buildSnapshot({ repo, commit: "HEAD", version: "1.0.0", repository: REPOSITORY }), error);
  }
  const repo = fork(t);
  assert.throws(() => buildSnapshot({ repo, commit: "HEAD", version: "1.0.0+build", repository: REPOSITORY }), /not SemVer/);
});

test("§2.2 integrity agrees with the product's valid example, and its invalid snapshot examples fail the manifest checks", () => {
  const dir = join(ROOT, "tools/test/fixtures/product-examples");
  const valid = JSON.parse(readFileSync(join(dir, "valid-from-lock.json"), "utf8"));
  assert.equal(integrity(valid.skills), valid.integrity);
  assert.equal(manifestReason(valid, schema), null);
  for (const name of readdirSync(dir).filter((file) => file.startsWith("snapshot-"))) {
    const manifest = JSON.parse(readFileSync(join(dir, name), "utf8"));
    assert.notEqual(manifestReason(manifest, schema), null, name);
  }
});

test("each §2.3 failure is reported with its reason id", async (t) => {
  const repo = fork(t);
  const fresh = async () => built(t, repo);
  const editManifest = (out, edit) => {
    const path = join(out, "snapshot.json");
    const manifest = JSON.parse(readFileSync(path, "utf8"));
    edit(manifest);
    writeFileSync(path, serialise(manifest));
  };
  const cases = [
    ["manifest-missing", (out) => rmSync(join(out, "snapshot.json"))],
    ["manifest-unparseable", (out) => writeFileSync(join(out, "snapshot.json"), "{")],
    ["manifest-schema", (out) => editManifest(out, (m) => { m.format = 2; })],
    ["manifest-order", (out) => editManifest(out, (m) => { m.skills.reverse(); m.integrity = integrity(m.skills); })],
    ["integrity", (out) => editManifest(out, (m) => { m.integrity = `sha256-${"0".repeat(64)}`; })],
    ["file-missing: brain-query/SKILL.md", (out) => rmSync(join(out, "brain-query/SKILL.md"))],
    ["not-a-file: brain-query/SKILL.md", (out) => { rmSync(join(out, "brain-query/SKILL.md")); mkdirSync(join(out, "brain-query/SKILL.md")); }],
    ["file-mismatch: brain-apply/SKILL.md", (out) => writeFileSync(join(out, "brain-apply/SKILL.md"), "tampered\n")],
    ["unlisted-entry: brain-apply/extra.md", (out) => writeFileSync(join(out, "brain-apply/extra.md"), "x\n")],
    ["unlisted-entry: .hidden", (out) => writeFileSync(join(out, ".hidden"), "x\n")],
    ["unlisted-entry: brain-apply/empty", (out) => mkdirSync(join(out, "brain-apply/empty"))],
    ["unlisted-entry: brain-link", (out) => symlinkSync("brain-apply", join(out, "brain-link"))],
  ];
  for (const [reason, damage] of cases) {
    const out = await fresh();
    damage(out);
    assert.equal(await validateSnapshot(out, schema), reason, reason);
  }
});
