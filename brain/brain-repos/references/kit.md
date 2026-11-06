# The link kit

spec/linked-repos.md §2–§7. `brain-kit.json` at the repo root; the only file the brain ever writes in a linked repo.

## Fields and key order

Write the keys in this order (absent keys skipped); lists keep their order:

```json
{
  "kit_version": 1,
  "name": "acme-api",
  "placement": { "area": "area-2m7c4h8n", "domain": "dom-5k8p2r7t", "project": "prj-9x4t1b7e" },
  "knowledge": {
    "patterns": ["decisions/**", "docs/**/*.md", "CHANGELOG.md"],
    "never_read": [".env*", "secrets/**", "docs/clients/**"]
  },
  "tasks": {
    "mode": "tracked-in-repo",
    "source": { "kind": "markdown", "path": "TASKS.md", "format": "checklist" },
    "status_map": { "/": "in_progress", "-": "dropped" }
  },
  "methodology": {
    "summary": "Decisions are recorded in decisions/ before code changes; each change is a small PR reviewed before merge.",
    "files": ["AGENTS.md"]
  }
}
```

- `name`: lowercase kebab-case, the repo's name in the brain (usually the folder name).
- `placement.area` (required): an `area-` id. `project` (optional): a `prj-` id of that Area; the rollup and the workflow summary go on it, and catch-up files the repo's notes under it. `domain` (optional): only the Area's own Domain, as a check; leave it out when unsure.
- `knowledge.patterns` (required, non-empty) and `never_read`: Git glob pathspecs from the repo root. `*` stops at `/`; `**/` is any depth; `docs/**` is everything under `docs/`; `.env*` matches only the root (`**/.env*` for any depth). Case-sensitive. `never_read` wins over `patterns`, for ingest, the rollup and the methodology files. The kit itself is never ingested.
- `tasks` (optional; absent means knowledge only, no rollup and no workflow):
  - `mode`: `connected` (Notion owns the tasks, through a connected workflow; `source` is `{ "kind": "notion" }` and there is no `status_map`) or `tracked-in-repo` (the repo owns them; the brain shows a read-only rollup).
  - `source`, key order `kind`, then `path`, `format`, `pattern` (markdown), `repo` (GitHub, `owner/name`) or `project` (GitLab, `group/name`).
  - `status_map`: raw status → `todo`, `in_progress`, `waiting`, `review`, `done` or `dropped`, added to the source's defaults: checklist `" "` → `todo`, `"x"`/`"X"` → `done`; GitHub `open` → `todo`, `closed:completed` → `done`, `closed:not_planned` → `dropped`; GitLab `opened` → `todo`, `closed` → `done`. Map a label as `label:<name>` (an open issue takes its first mapped label's meaning). Map every other status the source uses, so nothing is "not mapped".
  - A `pattern` source: a JavaScript regular expression (flag `u`) with a named group `title`, and optionally `status` and `id`; without `status`, map `""`.
- `methodology.summary` (required, at most 600 characters): how work is done there, in plain words. `files`: the documents holding it; they're read only when a pattern also matches them.
- `starter`: set by `repo new` only.

The file: UTF-8, 2-space indent, one trailing newline, accented and other characters written as themselves, not escaped. `JSON.stringify(kit, null, 2) + "\n"` with the keys in this order gives exactly that:

```sh
node -e 'const fs=require("fs");fs.writeFileSync(process.argv[2],JSON.stringify(JSON.parse(fs.readFileSync(process.argv[1],"utf8")),null,2)+"\n")' draft.json kit.json
```

(The draft must already have its keys in this order: the command keeps the order it reads.)

## Defaults to propose

- `patterns`: decision records (`decisions/**`, `adr/**`), docs that say what the work is (`docs/**/*.md`), `README.md`, `CHANGELOG.md`. Never code, tests, generated files or the task file.
- `never_read`: `.env*`, `secrets/**`, and any folder of client, personal or credential material you saw.
- Tasks: a `TASKS.md` or `PLAN.md` checklist → `tracked-in-repo` with that file; issues in use → that tracker; the user wants Notion to own them → `connected`.

**Starter** (`repo new`): `patterns` `["decisions/**", "docs/**", "README.md"]`, `never_read` `[".env*", "secrets/**"]`, tasks `tracked-in-repo` with `{ "kind": "markdown", "path": "TASKS.md", "format": "checklist" }` (the only source `repo new` accepts for that mode), and `methodology.summary` `"Record decisions in decisions/ before acting on them; plans in docs/; tasks in TASKS.md."` (the end becomes `tasks in Notion.` for connected, and is left out with no tasks). The user may change any of it before the yes.

## Issues (rollup input)

`brain repo tasks <name> --input <file>` with `{ "fetched_at": "<UTC now>", "items": [{ "number", "title", "state", "state_reason"?, "labels": [names], "url" }] }`:
- **GitHub:** `gh issue list --repo <owner/name> --state all --limit 1000 --json number,title,state,stateReason,labels,url`. `state` `OPEN`/`CLOSED` → `open`/`closed`; `stateReason` `COMPLETED`/`NOT_PLANNED` → `completed`/`not_planned`, anything else left out; `labels[].name` → `labels`.
- **GitLab:** `glab issue list --repo <group/name> --all --per-page 100 --page <n> --output json`, page by page until one is empty; `iid` → `number`, `state` as given (`opened`/`closed`), `labels`, `web_url` → `url`.
- At most 1,000 issues: pass the first 1,000.

## Health codes and their fixes

| Code | Fix in one line |
|---|---|
| `PATH_MISSING` (error) | The repo moved or is gone: `brain repo refresh <name> --path <new path>` (SKILL.md, "A repo that moved"), or unlink it |
| `KIT_MISSING` (error) | `brain-kit.json` was deleted: write it again (the yes) from the entry, or unlink |
| `KIT_INVALID` (error) | Fix the kit at the pointer shown (a change, with the yes) |
| `KIT_CHANGED` (warning) | The kit was edited: `brain repo refresh <name>` applies it (show what changes first with `--dry-run`) |
| `KIT_UNCOMMITTED` (info) | Commit `brain-kit.json` in the repo |
| `NO_KIT` (info) | Linked before kits; offer to write one, then `brain repo refresh <name>` applies it |
| `PLACEMENT_ARCHIVED` (warning) | Its Area or Project is archived: move the repo (a change) or unlink it |
| `COMMIT_UNKNOWN` (error) | The repo's history was rewritten: `brain repo record <name> --reset`; the next read skips what's already in |
| `CHANGES_WAITING` (info) | Files to read: "ingest the linked repo" or the next catch-up |
| `PATTERN_MATCHES_NOTHING` (warning) | A pattern finds no file: fix or remove it (a change) |
| `NEVER_READ_INGESTED` (warning) | Knowledge came from a path now never-read: nothing is removed; offer to archive those notes |
| `METHODOLOGY_FILE_MISSING` (warning) | Remove or fix that path in `methodology.files` |
| `TASK_SOURCE_MISSING` (error) | The task file isn't in the repo's last commit: fix the path, or commit the file |
| `STATUS_UNMAPPED` (warning) | Map that status in the kit's `status_map` (a change) |
| `CONNECTED_WITHOUT_WORKFLOW` (warning) | Tasks are meant for Notion but no workflow runs: adopt them (brain-workflow-adopt) or switch the mode |
| `WORKFLOW_WITHOUT_CONNECTED` (warning) | A connected workflow runs but the kit says otherwise: set `mode: connected`, or end the workflow |
| `BRAIN_LINK_STALE` (info) | The repo's `.brain` names another Project or Area: run `brain link` again with the kit's placement |
| `ROLLUP_STALE` (warning) | Rebuild the rollup |
