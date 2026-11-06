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

- `database`: the `brain.json` key: `domains`, `areas`, `goals`, `key_results`, `projects`, `people`, `orgs`, `decisions`, `questions`, `documents`, `review` or `inbox` (never `concepts`: retired in 0.9.1, `sync plan` refuses it) (`references` on a brain not yet upgraded is read as `documents`). Send only the databases of modules that are on (brain-sync step 2). Meetings are never a snapshot database.
- **The rows the plan acts on,** each in exactly this shape (send the properties shown, with these names; a row of a space not yet migrated uses the old name given in brackets):

  ```json
  { "database": "review", "page_id": "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b", "last_edited": "2026-12-05T08:15:00Z",
    "properties": { "Brain ID": "prp-1q5w8e3r", "State": "Pending", "Your call": "Approve", "What to fix": null } }
  ```
  A Review row: `Your call` is the select's label (`Approve`, `Reject`, `Fix`) or `null`; `What to fix` is its text or `null`; `State` is sent as Notion shows it (`Pending`, `Applied`, `Closed`). [Before migration 0009: `Decision` and `Note`.] Send every Review row that has a Brain ID, decided or not. A row of the new layout (its proposal has `published["@review"]`) also carries `"review": { "decided": true, "decided_at": "2026-12-05T08:10:00Z", "accept_all": false, "page_edited_at": "2026-12-05T08:12:00Z", "body_markdown": "…" }`: Decided, Decided at and Accept all as the page shows them, the page's `last_edited_time`, and its body as Markdown (a block you cannot convert is the line `<!-- unconvertible block -->`; `null` when the body cannot be read). brain-apply references/review-items.md §1 has the details.

  ```json
  { "database": "inbox", "page_id": "c3000000-0000-4000-8000-000000000001", "last_edited": "2026-12-05T08:20:00Z",
    "properties": { "Brain ID": "src-4m9q2x7c", "Document asked": true, "Only keep": null } }
  ```
  *(Documents)* An Inbox row whose Document asked box is ticked and that has a Brain ID. `Only keep` is its text or `null`. It becomes a `document_requests` item `{ "page_id", "source", "files", "only_keep", "existing"? }`.

  ```json
  { "database": "documents", "page_id": "c3000000-0000-4000-8000-000000000002", "last_edited": "2026-12-05T08:25:00Z",
    "properties": { "Brain ID": "vw-4c7n2k9p", "Refresh asked": true, "What to fix": "Lucía left Acme in June" } }
  ```
  *(Reports)* A Report row (a Documents page with Origin Report, decision 0071) with Refresh asked ticked or What to fix set. [Before migration 0019 it is an Inbox row: `"database": "inbox"`, read the same way. Before migration 0010: `Refresh`.] It becomes `refresh_requests` `{ "page_id", "report" }` and `report_fixes` `{ "page_id", "report", "text" }`.

  ```json
  { "database": "decisions", "page_id": "5f6a7b8c-9d0e-4f1a-8b2c-3d4e5f6a7b8c", "last_edited": "2026-12-05T08:30:00Z",
    "properties": { "Name": "Use Supabase for auth", "Summary": "…", "Lifecycle": "Draft", "Brain ID": "dec-7k2m9q4x", "Promote asked": true } }
  ```
  *(Documents)* A decision row also carries `Promote asked` (its other properties as usual). True becomes a `promote_requests` item `{ "page_id", "note", "existing"? }`.

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
