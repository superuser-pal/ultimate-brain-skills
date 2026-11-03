import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** The fork's root: the folder above tools/. */
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** The vendored copy of the product's snapshot schema (§10.1). */
export const loadSchema = (root = ROOT) => JSON.parse(readFileSync(join(root, "schemas", "skills-snapshot.schema.json"), "utf8"));

/** `--name value` pairs; a flag without a value is `true`. */
export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) throw new Error(`unexpected argument: ${argv[i]}`);
    const key = argv[i].slice(2);
    args[key] = argv[i + 1] !== undefined && !argv[i + 1].startsWith("--") ? argv[++i] : true;
  }
  return args;
}

/** Run `main`, printing an error and exiting 1 when it throws. */
export async function run(main) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`error: ${error.message}\n`);
    process.exitCode = 1;
  }
}

/** `https://github.com/<owner>/<repo>` from `--repository` or GITHUB_REPOSITORY. */
export function repositoryUrl(args) {
  if (typeof args.repository === "string") return args.repository;
  if (process.env.GITHUB_REPOSITORY) return `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  throw new Error("pass --repository https://github.com/<owner>/<repo> or set GITHUB_REPOSITORY");
}
