// The snapshot of spec/skills-delivery.md §2: built from Git (§10.2), its integrity (§2.2) and its validation (§2.3).
import { createHash } from "node:crypto";
import { lstat, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { Ajv2020 } from "ajv/dist/2020.js";

import { git, gitBuffer } from "./git.mjs";
import { parseRange, parseVersion } from "./semver.mjs";

export const SNAPSHOT_NAME = "ultimate-brain-skills";
export const OPTIONAL_FILES = ["LICENSE", "NOTICE.md", "README.md"];
const SKILL_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
export const byteOrder = (a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b));

/** §2.2: `sha256-` + the SHA-256 of the sorted lines `<sha256>  <skill>/<path>\n`. */
export function integrity(skills) {
  const lines = skills.flatMap((skill) => skill.files.map((file) => ({ key: `${skill.name}/${file.path}`, line: `${file.sha256}  ${skill.name}/${file.path}\n` })));
  lines.sort((a, b) => byteOrder(a.key, b.key));
  return `sha256-${sha256(Buffer.from(lines.map((entry) => entry.line).join(""), "utf8"))}`;
}

/** §2 serialisation: 2-space JSON, keys in the example's order, trailing newline. */
export function serialise(manifest) {
  const ordered = {
    format: manifest.format,
    name: manifest.name,
    version: manifest.version,
    cli: manifest.cli,
    source: manifest.source.commit === undefined ? { repository: manifest.source.repository } : { repository: manifest.source.repository, commit: manifest.source.commit },
    upstream: manifest.upstream === null ? null : { repository: manifest.upstream.repository, commit: manifest.upstream.commit },
    integrity: manifest.integrity,
    skills: manifest.skills.map((skill) => ({
      name: skill.name,
      targets: skill.targets,
      files: skill.files.map((file) => ({ path: file.path, sha256: file.sha256, bytes: file.bytes })),
    })),
  };
  return `${JSON.stringify(ordered, null, 2)}\n`;
}

/** A file's text at a commit, parsed as JSON; throws with the path when it is missing or broken. */
function jsonAt(repo, commit, path) {
  let text;
  try {
    text = git(repo, ["show", `${commit}:${path}`]);
  } catch {
    throw new Error(`${path} is missing at ${commit}`);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${path} is not valid JSON: ${error.message}`);
  }
}

/** snapshot.config.json at a commit, checked against §10.1: only `cli` (§2.1 grammar) and `linked_repo`. */
export function readSnapshotConfig(repo, commit) {
  const config = jsonAt(repo, commit, "snapshot.config.json");
  if (config === null || typeof config !== "object" || Array.isArray(config)) throw new Error("snapshot.config.json must be an object");
  const extra = Object.keys(config).filter((key) => key !== "cli" && key !== "linked_repo");
  if (extra.length > 0) throw new Error(`snapshot.config.json has unknown keys: ${extra.join(", ")}`);
  if (parseRange(config.cli) === null) throw new Error(`snapshot.config.json: cli "${config.cli}" breaks the range grammar`);
  if (!Array.isArray(config.linked_repo) || config.linked_repo.some((name) => typeof name !== "string")) throw new Error("snapshot.config.json: linked_repo must be a list of skill names");
  return config;
}

/** upstream.json at a commit: `{ repository, commit }` (§10.1). */
export function readUpstream(repo, commit) {
  const upstream = jsonAt(repo, commit, "upstream.json");
  const keys = Object.keys(upstream ?? {}).sort().join(",");
  if (keys !== "commit,repository" || !/^https:\/\//.test(upstream.repository) || !/^[0-9a-f]{40}$/.test(upstream.commit)) {
    throw new Error('upstream.json must be { "repository": "https://…", "commit": "<40 hex>" }');
  }
  return upstream;
}

/**
 * Build a snapshot from Git (§10.2): the blobs under brain/ at `commit`, as `git ls-tree -r` lists them. A symbolic link,
 * a submodule, a file directly in brain/ or a folder without SKILL.md fails. Returns the manifest and every file's bytes.
 */
export function buildSnapshot({ repo, commit, version, repository }) {
  const sha = git(repo, ["rev-parse", "--verify", `${commit}^{commit}`]).trim();
  if (parseVersion(version) === null) throw new Error(`version "${version}" is not SemVer without build metadata`);
  const config = readSnapshotConfig(repo, sha);
  const upstream = readUpstream(repo, sha);

  const byName = new Map();
  const listing = gitBuffer(repo, ["ls-tree", "-r", "-z", "--full-tree", sha, "--", "brain/"]).toString("utf8").split("\0").filter(Boolean);
  for (const entry of listing) {
    const [meta, path] = [entry.slice(0, entry.indexOf("\t")), entry.slice(entry.indexOf("\t") + 1)];
    const [mode, type, blob] = meta.split(" ");
    if (type === "commit") throw new Error(`${path}: a submodule can't be part of a snapshot`);
    if (mode === "120000") throw new Error(`${path}: a symbolic link can't be part of a snapshot`);
    const rest = path.slice("brain/".length);
    if (!rest.includes("/")) throw new Error(`${path}: only skill folders belong directly in brain/`);
    const name = rest.slice(0, rest.indexOf("/"));
    const file = rest.slice(name.length + 1);
    if (!SKILL_NAME.test(name)) throw new Error(`brain/${name}: a skill folder name is lowercase kebab-case`);
    const bytes = gitBuffer(repo, ["cat-file", "blob", blob]);
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push({ path: file, sha256: sha256(bytes), bytes: bytes.length, content: bytes });
  }
  if (byName.size === 0) throw new Error("brain/ holds no skills");
  for (const linked of config.linked_repo) if (!byName.has(linked)) throw new Error(`snapshot.config.json: linked_repo names ${linked}, which is not a folder in brain/`);

  const skills = [...byName.keys()].sort(byteOrder).map((name) => {
    const files = byName.get(name).sort((a, b) => byteOrder(a.path, b.path));
    if (!files.some((file) => file.path === "SKILL.md")) throw new Error(`brain/${name}: no SKILL.md`);
    return { name, targets: config.linked_repo.includes(name) ? ["brain", "linked_repo"] : ["brain"], files };
  });

  const manifest = {
    format: 1,
    name: SNAPSHOT_NAME,
    version,
    cli: config.cli,
    source: { repository, commit: sha },
    upstream: { repository: upstream.repository, commit: upstream.commit },
    integrity: integrity(skills),
    skills,
  };
  const extras = new Map();
  for (const name of ["LICENSE", "NOTICE.md"]) extras.set(name, gitBuffer(repo, ["show", `${sha}:${name}`]));
  return { manifest, extras };
}

/** Write a built snapshot to an empty or missing folder. */
export async function writeSnapshot({ manifest, extras }, out) {
  await mkdir(out, { recursive: true });
  if ((await readdir(out)).length > 0) throw new Error(`${out} is not empty`);
  await writeFile(join(out, "snapshot.json"), serialise(manifest));
  for (const [name, bytes] of extras) await writeFile(join(out, name), bytes);
  for (const skill of manifest.skills) {
    for (const file of skill.files) {
      const path = join(out, skill.name, ...file.path.split("/"));
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, file.content);
    }
  }
}

let compiled;
function schemaValidator(schema) {
  if (compiled?.schema !== schema) compiled = { schema, validate: new Ajv2020({ allErrors: false, strict: false }).compile(schema) };
  return compiled.validate;
}

/** The §2.3 manifest checks (rules 2–4) on a parsed manifest: the reason, or null. */
export function manifestReason(manifest, schema) {
  if (!schemaValidator(schema)(manifest)) return "manifest-schema";
  const sorted = (list, key) => list.every((item, i) => i === 0 || byteOrder(key(list[i - 1]), key(item)) < 0);
  if (!sorted(manifest.skills, (skill) => skill.name)) return "manifest-order";
  for (const skill of manifest.skills) {
    if (!sorted(skill.targets, (target) => target) || !sorted(skill.files, (file) => file.path)) return "manifest-order";
  }
  if (integrity(manifest.skills) !== manifest.integrity) return "integrity";
  return null;
}

/** §2.3 on a folder: null when valid, else the reason `<id>` or `<id>: <path>`. */
export async function validateSnapshot(folder, schema) {
  let text;
  try {
    if (!(await lstat(join(folder, "snapshot.json"))).isFile()) return "manifest-missing";
    text = await readFile(join(folder, "snapshot.json"), "utf8");
  } catch {
    return "manifest-missing";
  }
  let manifest;
  try {
    manifest = JSON.parse(text);
  } catch {
    return "manifest-unparseable";
  }
  const reason = manifestReason(manifest, schema);
  if (reason !== null) return reason;

  for (const skill of manifest.skills) {
    for (const file of skill.files) {
      const rel = `${skill.name}/${file.path}`;
      let stat;
      try {
        stat = await lstat(join(folder, ...rel.split("/")));
      } catch {
        return `file-missing: ${rel}`;
      }
      if (!stat.isFile()) return `not-a-file: ${rel}`;
      const bytes = await readFile(join(folder, ...rel.split("/")));
      if (bytes.length !== file.bytes || sha256(bytes) !== file.sha256) return `file-mismatch: ${rel}`;
    }
  }

  const listed = new Set(["snapshot.json"]);
  const folders = new Set();
  for (const skill of manifest.skills) {
    folders.add(skill.name);
    for (const file of skill.files) {
      const parts = `${skill.name}/${file.path}`.split("/");
      listed.add(parts.join("/"));
      for (let i = 1; i < parts.length; i++) folders.add(parts.slice(0, i).join("/"));
    }
  }
  const unlisted = [];
  const walk = async (rel) => {
    for (const entry of await readdir(join(folder, ...(rel === "" ? [] : rel.split("/"))), { withFileTypes: true })) {
      const path = rel === "" ? entry.name : `${rel}/${entry.name}`;
      if (rel === "" && OPTIONAL_FILES.includes(entry.name) && entry.isFile()) continue;
      if (entry.isDirectory() && !entry.isSymbolicLink() && folders.has(path)) await walk(path);
      else if (!(entry.isFile() && listed.has(path))) unlisted.push(path);
    }
  };
  await walk("");
  if (unlisted.length > 0) return `unlisted-entry: ${unlisted.sort(byteOrder)[0]}`;
  return null;
}
