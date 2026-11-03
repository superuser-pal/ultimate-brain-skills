// SemVer 2.0.0 without build metadata, and the CLI range grammar of spec/skills-delivery.md §2.1.

const NUMBER = "(?:0|[1-9][0-9]*)";
const PRERELEASE = "(?:-([0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*))?";
export const SEMVER = new RegExp(`^(${NUMBER})\\.(${NUMBER})\\.(${NUMBER})${PRERELEASE}$`);
const COMPARATOR = /^(>=|>|<=|<|=)(.+)$/;

/** `{ major, minor, patch, prerelease: string[] }`, or null when `text` is not SemVer without build metadata. */
export function parseVersion(text) {
  const match = SEMVER.exec(text);
  if (match === null) return null;
  const prerelease = match[4] === undefined ? [] : match[4].split(".");
  if (prerelease.some((part) => /^0[0-9]+$/.test(part))) return null;
  return { major: BigInt(match[1]), minor: BigInt(match[2]), patch: BigInt(match[3]), prerelease };
}

/** Precedence: negative when a < b, 0 when equal, positive when a > b. Both must be valid. */
export function compareVersions(a, b) {
  const x = parseVersion(a);
  const y = parseVersion(b);
  if (x === null || y === null) throw new Error(`not a version: ${x === null ? a : b}`);
  for (const key of ["major", "minor", "patch"]) if (x[key] !== y[key]) return x[key] < y[key] ? -1 : 1;
  if (x.prerelease.length === 0 || y.prerelease.length === 0) return y.prerelease.length - x.prerelease.length;
  for (let i = 0; i < Math.min(x.prerelease.length, y.prerelease.length); i++) {
    const p = x.prerelease[i];
    const q = y.prerelease[i];
    if (p === q) continue;
    const pn = /^[0-9]+$/.test(p);
    const qn = /^[0-9]+$/.test(q);
    if (pn && qn) return BigInt(p) < BigInt(q) ? -1 : 1;
    if (pn !== qn) return pn ? -1 : 1;
    return Buffer.compare(Buffer.from(p), Buffer.from(q));
  }
  return x.prerelease.length - y.prerelease.length;
}

/** The comparators of a CLI range, or null when it breaks the §2.1 grammar. */
export function parseRange(text) {
  if (typeof text !== "string" || text === "") return null;
  const comparators = [];
  for (const part of text.split(" ")) {
    const match = COMPARATOR.exec(part);
    if (match === null || parseVersion(match[2]) === null) return null;
    comparators.push({ operator: match[1], version: match[2] });
  }
  return comparators;
}
