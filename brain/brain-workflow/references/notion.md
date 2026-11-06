# Notion I/O for a connected run

spec/connected-workflows.md §6, §8–§10. Through the Notion MCP. Page ids are UUIDs (with or without dashes). Never write to a page beyond what a step names.

## The snapshot (input to `reconcile`)

Read Notion and the folder, then pass:

```json
{
  "read_at": "2026-11-04T09:30:00Z",
  "destination": { "page": "<destination page id>", "workflow": "Connected", "work_type": "Software", "logging_level": "Full durable record", "log_artifacts": [] },
  "tasks": [ { "page": "<id>", "brain_id": "wi-7c2m9q4x", "title": "…", "status": "Doing", "archived": false, "in_trash": false, "edited": "2026-11-04T09:20:00Z" } ],
  "documents": [ { "page": "<id>", "brain_id": "ref-4m8q2k6p", "edited": "2026-11-04T09:00:00Z" } ],
  "artifacts": [ { "id": "art-2p8k4m6n", "sha256": "sha256:<64 hex>" } ],
  "marked": []
}
```

- `read_at`: the time you read Notion (UTC).
- `destination`: the Project or Area page (its page id is the destination note's `notion` in `brain index --json`) and its four Workflow properties **as Notion shows their labels**; `null` for an empty select, `[]` for empty Log artifacts.
- `tasks`: **every** task of the Tasks database related to the destination (its Project relation for a Project, its Area relation for an Area), whatever its Brain ID; plus, by a Brain ID query, each workflow item whose page isn't related any more. Follow `next_cursor` to the end. `edited` is the page's `last_edited_time`; `archived` and `in_trash` as the API gives them. Send an archived or trashed page too.
- `documents`: the Documents pages of the workflow's artifacts that have a `note` (query the Documents database by Brain ID), with `last_edited_time`.
- `artifacts`: for each artifact whose `location.path` still exists in the folder, the hash of its bytes: `shasum -a 256 <file>`, written `sha256:<hex>`. Leave out a missing file.
- `marked`: the ids of open `mark_original` operations whose issue already has the comment "Tracked in Notion: <link>" (check with `gh issue view <n> --repo <owner/name> --comments` or `glab issue view`). Leave it out when there are none.

The reply: `routine` (changes it made: list them in the report in one line, "Notion status taken for 2 tasks"), `needs_you` (the questions), `busy` (operations another live session holds: leave them), `ops` (the operations to run now, in order).

## Operations

For each id in `ops`, read it (`brain workflow show <wf>`, `ops[]`), then:
1. `brain workflow op state <wf> <op> --state in_flight`, **before** the Notion call.
2. The call, by `kind` (below). After a write, read the page back; a value that isn't there isn't written again: the next reconcile handles it.
3. The outcome:
   - success: `op state … --state done --page <page id>` (the page for `create_task` and `publish_artifact`; give it for every kind);
   - a temporary error (`network`, `rate_limited`, `server`): retry up to 3 times, after 2 s, 8 s and 30 s, each with `in_flight` first and, for a create, the Brain ID lookup first (a hit ends the retries: `done` with that page); after that, `--state pending`. It is tried again in a later reconcile;
   - a lasting error (`validation`, `permission`, `missing_property`, `upload_unsupported`, `other`): `--state failed --error '{ "code": "validation", "message": "<the API message, short>", "lasting": true }'` at once. It stays in the records and is tried again at the next run's `reconcile --start`; after 3 failed runs it is asked "retry or drop?".

Never drop an operation yourself: only the user's "drop" does (`--state dropped`). Never delete a record or an operation file.

**`create_task`** (target `wi-`):
1. **Look up first, before every attempt** (a retry too: a call that timed out may still have created the page): query the Tasks database for Brain ID = the item's id. A hit means an earlier attempt created it: use that page (`done --page <it>`), never a second one.
2. Otherwise `brain workflow render <wf> --item <wi>`. `payload` is in the form of `brain sync tasks` (`database_id`, `properties` with each property's `type` and `value`, `pending_relations`): create the page in that database with those properties, typed as given. Leave out `pending_relations` (they are pages that don't exist yet).
3. Write the **Work record** toggle (below) with `toggle.markdown`.

**`update_task`** (target `wi-`): set the payload's `title` and `status` on `item.notion.page` (the property names and status type from `brain workflow render <wf> --item <wi>`'s `properties`), and `Brain ID` when the payload has `brain_id`. Then refresh the Work record toggle with that render's `toggle.markdown`.

**`publish_artifact`** (target `art-`), spec §6.3:
1. If the artifact has no `note`, write it with `brain note new`, **commit it** (`git add -A && git commit -m "workflow: note for <art>"`), then `artifact put` with `{ "id", "note": "<new id>" }` and the artifact's current `rev`. Every `brain workflow` command refuses a brain with uncommitted changes (`DIRTY_TREE`), so commit each brain write you make outside `brain workflow` before the next one:
   - `decision`: a `decision` note with `workflow: { "id": "<wf>", "artifact": "<art>" }` (the CLI writes it `reviewed`: the user approved it, so it gets its page), `date` the approval date, `projects: [<prj>]` for a Project destination or `area` for an Area, no `sources`; body `## Decision`, `## Context`, `## Consequences` from the artifact, and `## Sources` naming its location.
   - any other category: a `reference` note with `origin: workflow`, `workflow: { "id": "<wf>", "artifact": "<art>" }`, the same placement, no `sources`, and no `lifecycle` (the CLI writes it `reviewed` and refuses one in the input); the summary is the artifact's first sentence (at most 200 characters); the body is the file's text (a text artifact), or `File: <name> (<size>)` and its link (a binary one). A binary file with a `location.path` is also attached to the Document page through the MCP's file upload; with no upload available, fail the operation with `upload_unsupported` and ask the user for a URL.
   - the `note new` input for that Document, for example: `{ "notes": [{ "type": "reference", "title": "Workshop agenda", "frontmatter": { "summary": "<first sentence>", "origin": "workflow", "workflow": { "id": "wf-…", "artifact": "art-…" }, "area": "area-…" }, "body": "<the file's text>" }] }` (`"projects": ["prj-…"]` instead of `area` for a Project). Its `NO_SOURCES` warning is expected;
   - **a new version** of an artifact already published: a Document gets an `update_body` proposal, a decision a new decision with a `supersede` proposal. The user's approval of the new version in this session is the approval: apply it in chat (brain-apply), then publish.
2. Publish with `brain sync render --ids <note>`, the MCP create or update, and `brain sync record` (brain-sync, "Publish"), then **commit** (`workflow: publish <art>`). Before creating, look up the Brain ID in the Documents (or Decisions) database: a hit is updated, never duplicated.
3. `op state … done --page <page id>`.

**`mark_original`** (target `wi-`, payload `{ origin, treatment }`): first check for the comment (as for `marked`). If missing, comment "Tracked in Notion: https://www.notion.so/<item page id without dashes>" on the issue, add the label `transferred` when the repo has one, and for `close_transferred` close it (`gh issue close <n> --reason "not planned"`; GitLab `glab issue close`). Then `done`.

## The toggles

**Work record** (on a task page), **Workflow** (on the destination page): find the toggle heading with that exact name and replace its children; if the page has none, append the toggle heading at the end of the page, whatever other toggles it has. Write through the block API, as brain-ingest's references/notion.md "Writing a section through the MCP" describes; never through the Markdown page update, which flattens toggles. On a **Project** page with no toggle headings at all, first append empty "Brief" and "Decision log" toggle headings, so the next render can fill them. Everything outside the toggle is the user's.

`render`'s `toggle.markdown` and `summary`'s `markdown` are the exact text: write them as they are. Refresh an item's Work record after its task operation, and at the end of a run for each item with a page whose progress or criteria changed in the run.

## Answers (input to `resolve`)

| Question | Choices |
|---|---|
| `BOTH_CHANGED`: the title changed here and in Notion | `keep_mine` · `take_notion` |
| `STATUS_UNMAPPED`: a Notion status with no meaning | one of `todo`, `in_progress`, `waiting`, `review`, `done`, `dropped` |
| `TASK_ARCHIVED` | `drop` · `restore` (you restore the task in Notion; the next reconcile sees it) |
| `TASK_DELETED` | `drop` · `recreate` |
| `UNKNOWN_TASK`: a task under the destination that isn't the workflow's | `adopt` (run brain-workflow-adopt on it, origin `notion`) · `outside` (keep it out). Meeting or source action items (Brain ID `mtg-`, `src-`) suggest `outside` |
| `ARTIFACT_CHANGED`: the file changed since approval | `approve` (then `artifact put` with the new hash) · `ignore` |
| `DOCUMENT_BOTH_CHANGED`: the file and its Document both changed | `keep_notion` · `publish_mine` |

Word each in plain terms ("'Contact form' was renamed in Notion and here: keep yours, or take Notion's 'Contact page'?"). Then run `resolve`'s `ops` as above.

## When Notion is unreachable

Say so in the session, keep working on the records, leave operations `pending` (temporary error) and the summary unwritten. The Notion page keeps its last confirmed state; the next run catches up.
