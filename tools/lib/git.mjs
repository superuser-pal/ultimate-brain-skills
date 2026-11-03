import { execFileSync } from "node:child_process";

const MAX = 256 * 1024 * 1024;

/** Run git in `repo` and return stdout as bytes. */
export function gitBuffer(repo, args, options = {}) {
  return execFileSync("git", args, { cwd: repo, maxBuffer: MAX, stdio: ["pipe", "pipe", "pipe"], ...options });
}

/** Run git in `repo` and return stdout as text. */
export function git(repo, args, options = {}) {
  return gitBuffer(repo, args, options).toString("utf8");
}

/** Run git and report success instead of throwing; for exit-code questions such as `merge-base --is-ancestor`. */
export function gitOk(repo, args) {
  try {
    gitBuffer(repo, args);
    return true;
  } catch {
    return false;
  }
}
