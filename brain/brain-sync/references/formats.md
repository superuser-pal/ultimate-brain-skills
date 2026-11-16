# Sync input formats

A copy of the inputs in spec/cli.md §5.14, so the skill works from inside a brain where the product spec is not readable. If they ever disagree, the spec wins; report the difference.

## Snapshot (input to `brain sync plan`)

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

- `database`: the `brain.json` key: `domains`, `areas`, `goals`, `key_results`, `projects`, `people`, `orgs`, `documents`, `inbox` or `tasks` (the tracked tasks only, below) (never `concepts`: retired in 0.9.1, `sync plan` refuses it) (`references` on a brain not yet upgraded is read as `documents`). `review`, `decisions` and `questions` are retired in 0.16.0: only the 0.16.0 Notion migration sends them, once, with `--review-transition` or `--questions-transition` ([review-transition.md](review-transition.md)); a plain plan ignores their rows. Send only the databases of modules that are on (brain-sync step 2). Meetings are never a snapshot database.
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
- A property you did not read is left out, and is then not compared.

## Plan (input to `brain sync apply` and `brain sync render --plan`)

The `data` object of the `sync plan` reply. Not the whole reply. The one edit you make: each `accepted_wording` item gets a `verified` key, `{ "fingerprint": "<its fingerprint>", "page_edited_at": "<its page_edited_at>" }`, after you re-read its page just before applying (SKILL.md, "Accepted wording"). Add nothing else.

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
