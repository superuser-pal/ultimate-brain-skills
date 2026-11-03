// The impact declaration of spec/skills-delivery.md §10.4.

const DECLARATION = /^Brain impact: (none|compatible|coordinated)$/;
const ANY_DECLARATION = /^Brain impact:/;
const PRODUCT_LINK = /^Product: https:\/\/github\.com\/[^/]+\/ultimate-brain\/(issues|pull)\/[0-9]+$/;
const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/;

/**
 * The body's lines a reader sees: LF, trailing whitespace trimmed, fenced code and HTML comments removed. One pass, so
 * `<!--` inside a fence is code, and a fence marker inside a comment is comment. A backtick fence's info string can't
 * contain a backtick (CommonMark), so such a line opens nothing.
 */
export function visibleLines(body) {
  const lines = [];
  let fence;
  let inComment = false;
  for (const raw of (body ?? "").replace(/\r\n?/g, "\n").split("\n")) {
    let line = raw.replace(/\s+$/, "");
    if (fence !== undefined) {
      const close = FENCE.exec(line);
      if (close !== null && close[1][0] === fence[0] && close[1].length >= fence.length && close[2].trim() === "") fence = undefined;
      continue;
    }
    let visible = "";
    while (line !== "") {
      if (inComment) {
        const end = line.indexOf("-->");
        if (end === -1) line = "";
        else {
          line = line.slice(end + 3);
          inComment = false;
        }
      } else {
        const start = line.indexOf("<!--");
        if (start === -1) {
          visible += line;
          line = "";
        } else {
          visible += line.slice(0, start);
          line = line.slice(start + 4);
          inComment = true;
        }
      }
    }
    if (visible === "" && raw.trim() !== "") continue;
    const open = FENCE.exec(visible);
    if (open !== null && !(open[1][0] === "`" && open[2].includes("`"))) {
      fence = open[1];
      continue;
    }
    lines.push(visible.replace(/\s+$/, ""));
  }
  return lines;
}

/** `{ value, links }` declared in a PR body, or `{ error }`. */
export function parseDeclaration(body) {
  const lines = visibleLines(body);
  const declared = lines.filter((line) => ANY_DECLARATION.test(line));
  if (declared.length === 0) return { error: "the PR body has no `Brain impact:` line" };
  if (declared.length > 1) return { error: "the PR body has more than one `Brain impact:` line" };
  const match = DECLARATION.exec(declared[0]);
  if (match === null) return { error: `\`${declared[0]}\` is not one of none, compatible, coordinated` };
  return { value: match[1], links: lines.filter((line) => PRODUCT_LINK.test(line)).map((line) => line.slice("Product: ".length)) };
}

/** Whether a changed path is an operational change: anything in brain/, or snapshot.config.json. */
export const isOperational = (path) => path.startsWith("brain/") || path === "snapshot.config.json";

/**
 * The check's verdict: null when the declaration holds, else the reason.
 * `changed` lists every path the PR touches (old and new paths of renames and deletions); `cliChanged` says whether
 * `cli` in snapshot.config.json differs between the merge base and the head.
 */
export function impactProblem({ body, changed, cliChanged }) {
  const declaration = parseDeclaration(body);
  if (declaration.error) return declaration.error;
  const operational = changed.filter(isOperational);
  switch (declaration.value) {
    case "none":
      return operational.length === 0 ? null : `declared none, but the PR changes ${operational.slice(0, 3).join(", ")}${operational.length > 3 ? ", …" : ""}`;
    case "compatible":
      if (operational.length === 0) return "declared compatible, but the PR changes nothing in brain/ or snapshot.config.json; declare none";
      return cliChanged ? "declared compatible, but the PR changes the CLI range in snapshot.config.json; declare coordinated with a Product: link" : null;
    default:
      return declaration.links.length > 0 ? null : "declared coordinated without a `Product: https://github.com/<owner>/ultimate-brain/(issues|pull)/<n>` line";
  }
}
