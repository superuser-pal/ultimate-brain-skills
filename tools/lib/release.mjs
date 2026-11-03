// The release rules of spec/skills-delivery.md §10.2.
import { execFileSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

import { git } from "./git.mjs";
import { compareVersions, parseVersion } from "./semver.mjs";
import { buildSnapshot, sha256, validateSnapshot, writeSnapshot } from "./snapshot.mjs";

export const TAG_PREFIX = "brain-v";
/** The check runs that must have concluded `success` on the commit on main (§10.3). */
export const MAIN_CHECKS = ["skills", "names", "snapshot", "leak"];

/** The version a tag names, or null when it isn't `brain-v<SemVer without build metadata>`. */
export function tagVersion(tag) {
  if (!tag.startsWith(TAG_PREFIX)) return null;
  const version = tag.slice(TAG_PREFIX.length);
  return parseVersion(version) === null ? null : version;
}

/**
 * Why a tag may not be released, or null. `onMain`: the commit is reachable from main. `checkRuns`: `{ name, conclusion }`
 * of the commit's check runs. `released`: the tags that already have a GitHub release.
 */
export function releaseRefusal({ tag, onMain, checkRuns, released }) {
  const version = tagVersion(tag);
  if (version === null) return `${tag} is not brain-v<SemVer without build metadata>`;
  if (!onMain) return `${tag} points to a commit that isn't reachable from main`;
  const failed = MAIN_CHECKS.filter((name) => !checkRuns.some((run) => run.name === name && run.conclusion === "success"));
  if (failed.length > 0) return `CI did not succeed on this commit on main (${failed.join(", ")} not successful)`;
  if (released.includes(tag)) return `a release for ${tag} already exists`;
  const higher = released.map(tagVersion).filter((other) => other !== null && compareVersions(version, other) <= 0);
  if (higher.length > 0) return `${version} is not higher than the released ${higher.sort(compareVersions).at(-1)}`;
  return null;
}

/** The release notes: the tag's message (such as `Product-skills: <sha>`), then the three lines §10.2 requires. */
export function releaseNotes({ message, integrity, tarballSha256, cli }) {
  const head = message.trim() === "" ? "" : `${message.trim()}\n\n`;
  return `${head}Integrity: ${integrity}\nTarball-SHA256: ${tarballSha256}\nCLI: ${cli}\n`;
}

/**
 * Build, validate and pack a tag's snapshot into `work` (§10.2), without publishing anything: the tarball's root holds the
 * snapshot folder's entries, and the notes start with an annotated tag's message. Throws when the snapshot is invalid.
 */
export async function prepareRelease({ repo, tag, repository, work, schema }) {
  const version = tagVersion(tag);
  if (version === null) throw new Error(`${tag} is not brain-v<SemVer without build metadata>`);
  const folder = join(work, "snapshot");
  const built = buildSnapshot({ repo, commit: `refs/tags/${tag}`, version, repository });
  await writeSnapshot(built, folder);
  const reason = await validateSnapshot(folder, schema);
  if (reason !== null) throw new Error(`the built snapshot is invalid (${reason})`);
  const tarball = join(work, `ultimate-brain-skills-${version}.tar.gz`);
  execFileSync("tar", ["-czf", tarball, "-C", folder, ...(await readdir(folder)).sort()]);
  const annotated = git(repo, ["cat-file", "-t", `refs/tags/${tag}`]).trim() === "tag";
  const message = annotated ? git(repo, ["tag", "-l", "--format=%(contents)", tag]) : "";
  const notes = releaseNotes({ message, integrity: built.manifest.integrity, tarballSha256: sha256(await readFile(tarball)), cli: built.manifest.cli });
  return { version, folder, tarball, notes, prerelease: version.includes("-"), manifest: built.manifest };
}

/** Relative paths of every file under `root`, sorted. */
export async function listFiles(root, dir = root, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await listFiles(root, path, out);
    else out.push(relative(root, path).split("\\").join("/"));
  }
  return out.sort();
}

/** The first difference between two snapshot folders, or null when they hold the same files with the same bytes. */
export async function snapshotDifference(a, b) {
  const [x, y] = [await listFiles(a), await listFiles(b)];
  if (x.join("\n") !== y.join("\n")) return `file lists differ: ${x.filter((p) => !y.includes(p)).concat(y.filter((p) => !x.includes(p))).join(", ")}`;
  for (const path of x) if (!(await readFile(join(a, path))).equals(await readFile(join(b, path)))) return `${path} differs`;
  return null;
}
