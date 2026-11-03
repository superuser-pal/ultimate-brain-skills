import assert from "node:assert/strict";
import { test } from "node:test";

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadSchema } from "../lib/cli.mjs";
import { MAIN_CHECKS, prepareRelease, releaseNotes, releaseRefusal, snapshotDifference, tagVersion } from "../lib/release.mjs";
import { compareVersions, parseRange, parseVersion } from "../lib/semver.mjs";
import { sha256, validateSnapshot } from "../lib/snapshot.mjs";
import { commit, forkFiles, initRepo, run, skill, tempDir } from "./helpers.mjs";

const green = MAIN_CHECKS.map((name) => ({ name, conclusion: "success" }));
const refusal = (fields) => releaseRefusal({ tag: "brain-v1.1.0", onMain: true, checkRuns: green, released: ["brain-v1.0.0"], ...fields });

test("versions follow SemVer 2.0.0 precedence and reject build metadata", () => {
  const order = ["0.9.0-0", "0.9.0-alpha", "0.9.0-alpha.1", "0.9.0-alpha.beta", "0.9.0-beta.2", "0.9.0-beta.11", "0.9.0-rc.1", "0.9.0", "0.10.0", "1.0.0"];
  for (let i = 1; i < order.length; i++) assert.ok(compareVersions(order[i - 1], order[i]) < 0, `${order[i - 1]} < ${order[i]}`);
  assert.equal(compareVersions("1.0.0", "1.0.0"), 0);
  for (const bad of ["1.0", "1.0.0+build", "01.0.0", "1.0.0-01", "v1.0.0", "1.0.0-"]) assert.equal(parseVersion(bad), null, bad);
  assert.deepEqual(parseRange(">=0.9.0 <0.10.0"), [{ operator: ">=", version: "0.9.0" }, { operator: "<", version: "0.10.0" }]);
  for (const bad of ["^0.9.0", ">=0.9.0  <1.0.0", ">= 0.9.0", ">=0.9.0 || <1.0.0", "", ">=0.9.0+b"]) assert.equal(parseRange(bad), null, bad);
});

test("a malformed tag is refused", () => {
  for (const tag of ["brain-v1.1", "brain-v1.1.0+build", "brain-1.1.0", "v1.1.0", "brain-vlatest"]) {
    assert.equal(tagVersion(tag), null);
    assert.match(refusal({ tag }), /is not brain-v<SemVer/);
  }
});

test("a commit not on main is refused", () => {
  assert.match(refusal({ onMain: false }), /isn't reachable from main/);
});

test("a commit without successful CI on main is refused", () => {
  assert.match(refusal({ checkRuns: [] }), /skills, names, snapshot, leak not successful/);
  assert.match(refusal({ checkRuns: green.map((run) => (run.name === "leak" ? { ...run, conclusion: "failure" } : run)) }), /\(leak not successful\)/);
});

test("an existing release and a version not higher than every release are refused", () => {
  assert.match(refusal({ tag: "brain-v1.0.0" }), /already exists/);
  assert.match(refusal({ tag: "brain-v0.9.0" }), /not higher than the released 1\.0\.0/);
  assert.match(refusal({ tag: "brain-v1.0.0-rc.1" }), /not higher/);
  assert.match(refusal({ released: ["brain-v1.0.0", "brain-v1.2.0"] }), /not higher than the released 1\.2\.0/);
});

test("a valid tag is released, prereleases included", () => {
  assert.equal(refusal({}), null);
  assert.equal(refusal({ tag: "brain-v1.1.0-rc.1" }), null);
  assert.equal(refusal({ tag: "brain-v1.0.0", released: [] }), null);
});

test("the notes end with the Integrity, Tarball-SHA256 and CLI lines", () => {
  const notes = releaseNotes({ message: `Product-skills: ${"b".repeat(40)}\n`, integrity: `sha256-${"c".repeat(64)}`, tarballSha256: "d".repeat(64), cli: ">=0.9.0 <0.10.0" });
  assert.equal(notes, `Product-skills: ${"b".repeat(40)}\n\nIntegrity: sha256-${"c".repeat(64)}\nTarball-SHA256: ${"d".repeat(64)}\nCLI: >=0.9.0 <0.10.0\n`);
  assert.ok(releaseNotes({ message: "", integrity: "i", tarballSha256: "t", cli: "c" }).startsWith("Integrity: i\n"));
});

test("prepareRelease packs the tag's snapshot with the tag message in the notes, and a rebuild matches it", async (t) => {
  const repo = initRepo(join(tempDir(t), "fork"));
  commit(repo, forkFiles(), "fork");
  run(repo, ["tag", "-a", "brain-v1.0.0-rc.1", "-m", `Product-skills: ${"b".repeat(40)}`]);
  commit(repo, { "brain/brain-apply/SKILL.md": skill("brain-apply", "Changed after the tag.\n") }, "later");
  const schema = loadSchema();
  const work = tempDir(t);
  const prepared = await prepareRelease({ repo, tag: "brain-v1.0.0-rc.1", repository: "https://github.com/example/ultimate-brain-skills", work, schema });

  assert.equal(prepared.prerelease, true);
  assert.equal(prepared.manifest.source.commit, run(repo, ["rev-parse", "brain-v1.0.0-rc.1^{commit}"]).trim(), "the tagged commit, not the branch head");
  assert.ok(prepared.notes.startsWith(`Product-skills: ${"b".repeat(40)}\n\nIntegrity: ${prepared.manifest.integrity}\nTarball-SHA256: ${sha256(readFileSync(prepared.tarball))}\nCLI: >=0.9.0 <0.10.0\n`));
  const listing = execFileSync("tar", ["-tzf", prepared.tarball], { encoding: "utf8" }).split("\n").filter(Boolean);
  assert.ok(listing.includes("snapshot.json") && listing.includes("brain-apply/SKILL.md") && listing.every((path) => !path.startsWith("./") && !path.startsWith("snapshot/")), "the tarball's root holds the snapshot's entries");

  const extracted = join(work, "extracted");
  mkdirSync(extracted);
  execFileSync("tar", ["-xzf", prepared.tarball, "-C", extracted]);
  assert.equal(await validateSnapshot(extracted, schema), null);
  assert.equal(await snapshotDifference(extracted, prepared.folder), null);
  writeFileSync(join(extracted, "brain-query/SKILL.md"), "tampered\n");
  assert.equal(await snapshotDifference(extracted, prepared.folder), "brain-query/SKILL.md differs");

  await assert.rejects(prepareRelease({ repo, tag: "brain-v1.0", repository: "https://github.com/example/x", work: tempDir(t), schema }), /not brain-v/);
  run(repo, ["tag", "brain-v1.0.0"]);
  const plain = await prepareRelease({ repo, tag: "brain-v1.0.0", repository: "https://github.com/example/x", work: tempDir(t), schema });
  assert.equal(plain.prerelease, false);
  assert.ok(plain.notes.startsWith("Integrity: "), "a lightweight tag adds no message");
});
