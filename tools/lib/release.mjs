// The release rules of spec/skills-delivery.md §10.2.
import { compareVersions, parseVersion } from "./semver.mjs";

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
