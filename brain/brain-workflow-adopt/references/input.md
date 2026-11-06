# The adoption input

spec/connected-workflows.md §11.2–§11.6 and spec/linked-repos.md §2.4. The same input goes to `adopt preview` and `adopt apply`; unknown keys fail.

```json
{
  "sources": [ { "kind": "markdown", "ref": "PLAN.md" } ],
  "items": [
    { "origin": { "kind": "markdown", "ref": "PLAN.md", "key": "line:4c79cdbe783c" },
      "title": "Write the homepage copy", "body": "", "raw_status": "/", "meaning": "in_progress",
      "depends_on": [], "url": null, "brain_id": null }
  ],
  "unsupported": [],
  "conventions": [ { "rule": "Status lives in PLAN.md", "source": "AGENTS.md" } ],
  "selected": null,
  "treatments": {},
  "status_read": {}
}
```

- `sources`: every source you read, even one with no items left (so its vanished keys are reported as missing). A source you didn't read this time is left out.
- `items[].meaning`: one of `todo`, `in_progress`, `waiting`, `review`, `done`, `dropped`, from the source's status map (below), else your proposal, shown in the preview.
- `depends_on`: the origin keys of the items this one depends on ("after the page list", "blocked by #12").
- `url`: the issue's URL, else `null`. `brain_id`: a Notion task's current Brain ID (origin `notion` only), else `null`.
- `body`: the issue's description, or the indented lines under a plan item; `""` when there is none.
- `conventions`: only the rules that **conflict** with a connected workflow, each with the file it came from. For `apply`, each gets `"choice"` (and `"note"` with `adapt`).
- `selected`: `null` for the default (every new item that isn't done or dropped), or the list of keys the user chose.

## Keys (a rerun depends on them)

| Source | `ref` | `key` |
|---|---|---|
| Markdown | the file path, relative to the folder | the item's id when the plan has one (a kit `pattern` with an `id` group), else `line:` + the first 12 hex characters of the SHA-256 of the **trimmed title** |
| GitHub | `owner/name` | `#<number>` |
| GitLab | `group/name` | `#<iid>` |
| Notion | `tasks` | the page id |
| Other | the system's name | its own id |

Compute a `line:` key with:

```sh
node -e 'const t=process.argv[1].trim();console.log("line:"+require("crypto").createHash("sha256").update(t).digest("hex").slice(0,12))' "Write the homepage copy"
```

Two items with the same key in one file get `#2`, `#3`, … in file order (`line:4c79cdbe783c#2`).

For a **kit-linked repo** whose kit has a `tracked-in-repo` Markdown source, `brain repo tasks <name>` returns every item with its key, raw status and meaning already computed: use those (it reads the file as committed; mention uncommitted changes, `REPO_DIRTY`).

## Reading each source

**Markdown checklist** (`- [c] title`, also with `*` or `+`, indented too): skip fenced code blocks and lines over 2,000 characters. The raw status is the character between the brackets. Default meanings: `" "` → `todo`, `"x"`/`"X"` → `done`; a kit's `status_map` adds to these. Any other character (`/`, `-`, `?`) gets your proposed meaning (`/` → `in_progress`, `-` → `dropped`, `?` → `waiting` or `todo`: say which and why in the preview). `[]`, longer brackets and numbered lines are not items. A plan in another shape (headings with statuses, a table) is read by judgment: show each item with the line it came from.

**GitHub:** `gh issue list --repo <owner/name> --state all --limit 1000 --json number,title,body,state,stateReason,labels,url`. Raw status: `open`, `closed:completed` (also a closed issue with no reason), `closed:not_planned`, or `label:<name>` for an open issue whose label a map names. Defaults: `open` → `todo`, `closed:completed` → `done`, `closed:not_planned` → `dropped`.

**GitLab:** `glab issue list --repo <group/name> --all --per-page 100 --page <n> --output json`, page by page until one is empty. Raw status: `opened`, `closed`, `label:<name>`. Defaults: `opened` → `todo`, `closed` → `done`.

**Notion tasks** under the destination: the Tasks database's pages related to the Project or Area. The raw status is the Status option; its meaning is the workflow's `status_map` (the meaning whose option it is) or `status_read`; an option in neither comes back in `status_options`, and `apply` needs `status_read: { "<option>": "<meaning>" }` for it. Leave out tasks the workflow already has (Brain ID `wi-`). Meeting and source action items (Brain ID `mtg-`, `src-`) are usually not project work: say so and leave them unselected unless the user wants them.

**Other systems** (Jira, Linear, a spreadsheet the user exports): origin `other`, `ref` the system's name, its own ids as keys. List in `unsupported` what doesn't map (custom fields, sprints, workflow states, estimates). Apply only on the user's explicit yes to that mapping.

## Treatments of originals

| Original | Choices |
|---|---|
| Markdown | `keep` only |
| GitHub, GitLab issue | `keep` (default), `mark_transferred`, `close_transferred` |
| Notion task | `keep` only |
| Other | `keep` only |
