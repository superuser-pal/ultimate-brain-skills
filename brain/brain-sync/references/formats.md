# Sync input formats

A copy of the inputs in spec/cli.md §5.14, so the skill works from inside a brain where the product spec is not readable. If they ever disagree, the spec wins; report the difference.

## Snapshot (input to `brain sync plan`)

Written by `brain sync snapshot` (SKILL.md step 3, spec/cli.md §5.14.10) from the query replies you saved and your `rows.json`; never by hand. The rows below are what it writes, and `rows.json` uses the same row format, with no other field, for the rows that are no query reply: a tracked task read by its id, and a Documents or Report row read for wording (its `Brain ID` and its `wording` object).

```json
{
  "as_of": "2026-12-05T09:00:00Z",
  "rows": [
    {
      "database": "people",
      "page_id": "6a7b8c9d-0e1f-4a2b-8c3d-4e5f6a7b8c9d",
      "last_edited": "2026-12-05T08:40:00Z",
      "properties": {
        "Name": "Maria López", "Summary": "Product lead at Acme.", "Role": "Product lead",
        "Email": "maria@acme.example", "Lifecycle": "Reviewed",
        "Brain ID": "per-3h8w2n6c", "Org": ["9b8a7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d"]
      }
    }
  ]
}
```

- `database`: the `brain.json` key: `domains`, `areas`, `goals`, `key_results`, `projects`, `people`, `orgs`, `documents`, `inbox` or `tasks` (the tracked tasks, the tasks kept as documents and the tasks with no Area only, below) (never `concepts`: retired in 0.9.1, `sync plan` refuses it) (`references` on a brain not yet upgraded is read as `documents`). `review`, `decisions` and `questions` are retired in 0.16.0: only the 0.16.0 Notion migration sends them, once, with `--review-transition` or `--questions-transition` ([review-transition.md](review-transition.md)); a plain plan ignores their rows. Send only the databases of modules that are on (brain-sync step 2). Meetings are never a snapshot database.
- **The rows the plan acts on,** each in exactly this shape (send the properties shown, with these names; a row of a space not yet migrated uses the old name given in brackets):

  ```json
  { "database": "inbox", "page_id": "c3000000-0000-4000-8000-000000000001", "last_edited": "2026-12-05T08:20:00Z",
    "properties": { "Brain ID": "src-4m9q2x7c", "Document asked": true, "Only keep": null } }
  ```
  *(Documents)* An Inbox row whose Document asked box is ticked and that has a Brain ID. `Only keep` is its text or `null`. It becomes a `document_requests` item `{ "page_id", "source", "files", "only_keep", "existing"? }`.
  Every other Inbox row with a Brain ID is passed with that property only:
  ```json
  { "database": "inbox", "page_id": "c3000000-0000-4000-8000-000000000002", "last_edited": "2026-12-05T08:25:00Z",
    "properties": { "Brain ID": "src-2b7m9k4e" } }
  ```
  `sync plan` links the source to the page when the source has no `notion` yet (a publish that stopped before `sync record`), and compares nothing else (spec/cli.md §5.14.2, CC-153).

  ```json
  { "database": "documents", "page_id": "c3000000-0000-4000-8000-000000000002", "last_edited": "2026-12-05T08:25:00Z",
    "properties": { "Brain ID": "vw-4c7n2k9p", "Refresh asked": true, "What to fix": "Lucía left Acme in June" } }
  ```
  *(Reports)* A Report row (a Documents page with Origin Report, decision 0071) with Refresh asked ticked or What to fix set. [Before migration 0019 it is an Inbox row: `"database": "inbox"`, read the same way. Before migration 0010: `Refresh`.] It becomes `refresh_requests` `{ "page_id", "report" }` and `report_fixes` `{ "page_id", "report", "text" }`.

  ```json
  { "database": "tasks", "page_id": "d4000000-0000-4000-8000-000000000001", "last_edited": "2026-12-05T08:10:00Z",
    "properties": { "Name": "Can the site go live by the end of March?", "Status": "Done" }, "status_group": "complete" }
  { "database": "tasks", "page_id": "d4000000-0000-4000-8000-000000000002", "last_edited": "2026-12-05T08:12:00Z",
    "properties": { "Name": "Driver shortage in the north", "Status": "In Progress" }, "status_group": "in_progress", "gone": true }
  { "database": "tasks", "page_id": "d4000000-0000-4000-8000-000000000003", "last_edited": null, "properties": {}, "unreadable": true }
  ```
  *(Tasks)* A tracked task, one per entry of `brain sync tracked`, read by its page id (SKILL.md step 2): the mapped title and status properties under their Notion names, and `status_group` (`todo`, `in_progress`, `complete` for a Notion Status property; `null` for a select). A page in the trash adds `"gone": true`. A page Notion can't find is `"unreadable": true` with `last_edited: null` and no properties, never `gone`. A finished one (Done, Won't Do, gone, unreadable) becomes a `tracked_tasks` item `{ "question", "page_id", "page_title"?, "state", "status", "observed_at" }`, which `sync apply` writes as a pending `tracked_task`.

  ```json
  { "database": "tasks", "page_id": "d4000000-0000-4000-8000-000000000004", "last_edited": "2026-12-05T08:15:00Z",
    "properties": { "Name": "Check go-live with hosting", "Document asked": true, "Project": ["b2000000-0000-4000-8000-000000000001"], "Area": [] } }
  ```
  *(Tasks, Documents)* A task whose Document asked box is ticked (decision 0100), with `notion.tasks.properties.document_asked` mapped: its title, Document asked, Project and Area under their mapped names. A task that is also tracked is one row with the properties of both. It becomes a `task_documents` item `{ "page_id", "title", "projects", "area", "question", "source", "existing" }`; with Documents off it is `ignored`, `MODULE_OFF`.

  ```json
  { "database": "documents", "page_id": "6a7b8c9d-0e1f-4a2b-8c3d-4e5f6a7b8c9d", "last_edited": "2026-12-10T10:00:00Z",
    "properties": { "Brain ID": "ref-5k8m2q7w" },
    "wording": { "accepted": true, "accepted_at": "2026-12-10T10:00:00Z", "page_edited_at": "2026-12-10T10:00:00Z",
                 "body_markdown": "> Purpose: decide the login.\n\n## Main content\n\nEmail login only.\n",
                 "unconvertible": false, "pending_revision": false, "pending_refresh": false } }
  ```
  *(Documents, Reports)* A promoted Document, or a Report row (Brain ID a `vw-` report), may carry a `wording` object (the rules are under "Accepted wording" in SKILL.md): `accepted`, `accepted_at` (null when empty), `page_edited_at` (the page's own `last_edited_time`), `body_markdown` (the body converted as the SKILL says, without any Proposed revision toggle or Proposed refresh toggle; `null` when `unconvertible`), `unconvertible`, `pending_revision`, `pending_refresh`. All seven keys are required. It becomes `accepted_wording`, `wording_waiting`, `wording_held` and `clear_accepted` items.

  Every other row of a configured database is sent with every property you read, as the `people` row above.
- `properties`: the Notion property names exactly, with normalized values:

  | Notion type | Normalized value |
  |---|---|
  | title, text, select, status, url, email | string; empty → `null` |
  | number | number or `null` |
  | checkbox | boolean |
  | date | `{"start": "<date or timestamp>", "end": "<…>" or null}` or `null` |
  | relation | array of page ids, sorted |
  | formula, rollup | their scalar result |
  | rollup of a relation (Show original) | a relation: array of page ids, sorted; empty → `[]` |
- A property you did not read is left out, and is then not compared.

## Reading the tracked tasks and the tasks to keep as documents (SKILL.md step 2)

**Tracked tasks** *(Tasks; decision 0101 §6)*: run `brain sync tracked`. For each entry, read its task **page by its id** (`page_id`, never a query, so a page in the trash is still found), and pass one `tasks` row (references/formats.md):
- a page you can read and that isn't in the trash: its title and status properties (the mapped ones, `notion.tasks.properties`), `last_edited`, and `status_group`: the group of the status option (`todo`, `in_progress`, `complete`) for a Notion Status property, `null` for a select;
- a page in the trash: the same, with `"gone": true`;
- a page Notion can't find (deleted for good, or no longer shared with the integration; the brain can't tell which): `"unreadable": true`, `last_edited: null`, empty `properties`. Never pass it as `gone`.

A read that fails for another reason (a timeout, an expired login) passes no row for that page.

**Tasks to keep as documents** *(Tasks, Documents; decision 0100)*: with `notion.tasks.properties.document_asked` mapped (not `""`), query the Tasks data source for the rows whose Document asked box is ticked, and pass each with its title, Document asked, Project and Area under their mapped names (references/formats.md). A task that is also tracked is passed once, with the properties of both. Its body is read only when `sync plan` lists it in `task_documents`, by brain-ingest references/task-document.md. Nothing else of a task is read here.

## Tasks with no Area (a catch-up only)

*(Tasks; decisions 0113 §9, 0114)* At a catch-up, with `notion.tasks.properties.area` mapped and `project` mapped or (Factories on) `factory` mapped, query the Tasks data source for the rows where Area is empty, **and** Project or Factory is not empty, **and** the status is not finished: not an option of the Status property's complete group (a select: not `Done`) and not `notion.tasks.wont_do_status` (read the options from the data source; with no status mapped, no task is finished). Follow `next_cursor`, and save each reply as any other: `brain sync snapshot` keeps of each task its title, Status, Area, Project and Factory. Page bodies are never read for this. `brain sync` outside a catch-up doesn't run this query.

`sync plan` then gives:
- `task_areas`: `{ "page_id", "title", "area", "from": "project" | "factory", "property", "payload": { "type": "relation", "value": [ … ], "mode": "if_empty" } }`: the Area its Projects share, or with no Project its Factories'. The catch-up's publish writes each while the Area is still empty (brain-catch-up references/publish.md, "Step 4.1.2b"). Nothing of it is applied by `sync apply` or recorded, and nobody is asked.
- `task_areas_unset`: `DIFFERENT_AREAS` (named under Check, by title) or `NOT_IN_BRAIN` (not named; a later catch-up reads it again).

## Reading the Report rows (SKILL.md step 2)

*(Reports)* Of Documents, the **Report rows** (Origin Report, a `vw-` Brain ID) whose **Refresh asked** box is ticked or whose **What to fix** is not empty, with Brain ID, Refresh asked and What to fix (decisions 0045, 0048, 0071); nothing else on them is compared. A space not yet migrated (migration 0010) has **Refresh** instead: send whichever the space has. `sync plan` turns them into `refresh_requests` and `report_fixes`. They are the brain-query skill's work ("Report mode", "Refresh" and "What to fix on a report"): run it for each after step 6, or leave them for the next catch-up and say so.

## Example rows (SKILL.md step 2)

**Example rows** (decision 0084): every row whose title starts with `Example · ` (the word `Example`, a space, the middle dot `·`, a space, matched exactly) is left out of the snapshot by `brain sync snapshot` (step 3): the Notion template's invented rows, which setup removes when it connects the brain. Left out, such a row is never imported, corrected or matched, and nothing in the brain is made from it. Leaving it out is not skipping a database. Name how many (`examples_left_out`) once in the report: "2 example rows left out: delete them in Notion, or say "set up my brain" to remove them".

## Inputs of `brain sync snapshot`

`brain sync snapshot --input <folder or file> [--input …] --output <tmp>/snapshot.json`; a folder stands for every `.json` file in it. Each file is one of:
- **A query reply**, saved as the MCP returned it: `{ "object": "list", "results": [ <pages> ], "has_more": …, "next_cursor": … }`, one page of results. The row's database comes from each page's `parent.database_id`.
- **`rows.json`:** `{ "rows": [ <rows in the snapshot format above> ] }`, nothing else at the top. A row whose page also came from a query reply joins it only when it is a tracked task (onto that task's Document-asked row) or carries `wording` (onto its Documents row); the same property must have the same value in both. A task whose status changed between the Tasks query and its page read is `INPUT_INVALID`: read both again, then run `sync snapshot` again.

Anything else is `INPUT_INVALID`. The reply's `data` is `{ "output", "rows", "examples_left_out", "databases" }`.

## Plan (input to `brain sync apply` and `brain sync render --plan`)

The `data` object of the `sync plan` reply. Not the whole reply. The one edit you make: each `accepted_wording` item gets a `verified` key, `{ "fingerprint": "<its fingerprint>", "page_edited_at": "<its page_edited_at>" }`, after you re-read its page just before applying (SKILL.md, "Accepted wording"). Add nothing else.

## Ignored plan items (SKILL.md step 5)

- **Ignored:** e.g. `NOT_CORRECTABLE`. "You changed a decision's Assessment in Notion; that can't be changed by editing. Tell me what's wrong and I'll propose it." `MODULE_OFF` (a row of a module that is off), `RETIRED` (a Full text box from before 0.6.0), `REVIEW_ROW` and `RETIRED_DATABASE` (a row of a database retired in 0.16.0, read before its migration ran) need no line; when there are any, say once: "The 0.16.0 Notion migration hasn't run yet: say "migrate my Notion space"".

## Record (input to `brain sync record`)

```json
{ "records": [
  { "id": "per-3h8w2n6c", "notion": "6a7b8c9d-0e1f-4a2b-8c3d-4e5f6a7b8c9d",
    "synced_at": "2026-12-05T09:01:10Z", "published": { "Name": "Maria López", "Brain ID": "per-3h8w2n6c" } }
] }
```

- One record per page actually written. `synced_at` is required.
- `published`: the render item's `published`. For a Document or report body you just wrote, add `"@notion_body": "sha256:<hex>"`: the hash of the Markdown you read back from the page right after writing it (SKILL.md, "Accepted wording", step 6); if the read-back failed, `"@notion_body": null`, which removes the old baseline.
- `tasks` (meetings and sources): the new task page ids.
- A Factory's record has its `fac-` id, `notion`, `synced_at` and `published`, and no other key.
- A meeting's `published` holds `"Brain Status": "Done"` since 0.16.2 (decision 0109: Meetings use the Inbox's names New, Ready and Done; Skipped stays). A record written before holds `Ingested`: `sync render` reads it as `Done` (and Reviewed as Ready, Not Reviewed as New), so the renamed option sends no write. Never edit an old record by hand.
