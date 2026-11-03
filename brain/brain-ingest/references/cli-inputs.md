# CLI inputs for an ingest

The JSON the ingest passes to the CLI, taken from a real run on the synthetic Acme brain (tests/fixtures/brain-acme) with the minutes in tests/fixtures/minutes/2026-12-10-acme-launch-review.md. The contracts are spec/cli.md §5.5 (`note new`), §5.6 (`proposal new`) and §5.14.5 (`sync tasks`). Write each input to a temporary file and pass `--input <file>`, or pipe it with `--input -`.

## 1. Source snapshot

```json
{ "notes": [ {
  "type": "source",
  "title": "Acme launch review (minutes)",
  "file_date": "2026-12-10",
  "frontmatter": { "source_key": "notion:3c4d5e6f-7a8b-4c0d-9e2f-3a4b5c6d7e8f", "origin_edited": "2026-12-10T16:40:00Z" },
  "body": "<the minutes, verbatim>"
} ] }
```

- **`source_key`:** `notion:<page id>` in Notion mode. In Markdown-only mode, use `url:https://…` if the minutes have a URL, else `agent:<agent>/<id>`, where `<id>` is any stable string you choose (e.g. `agent:claude-code/2026-12-10-acme-launch-review`). It records where the text came from; duplicates of minutes are detected by `content_hash`, not by this key.
- **Body:** in Notion mode, built exactly as [notion.md](notion.md) "What counts as minutes" says. In Markdown-only mode, the text the user gave, with LF line endings. Otherwise verbatim.
- **Source id:** take it from the same `brain id new` call as the other notes (step 7); the step 3 dry-run runs without one. Steps 3 and 7 use the same item; step 7 only adds the `id`. The CLI picks the folder from the key (`sources/notion/`, `sources/files/`, `sources/text/`).
- **`origin_edited`:** the Notion page's `last_edited_time` (Notion mode only).
- **Do not set `content_hash` or `captured`;** the CLI sets both. The body must use LF line endings.
- **Title:** `<meeting title> (minutes)`. `file_date` is the meeting date.

## 1b. Other sources (references/sources.md)

A document, a web page, then a pasted email:

```json
{ "notes": [
  { "type": "source", "title": "Acme website brief (document)", "file_date": "2026-12-04",
    "frontmatter": { "source_key": "file:sha256:<64 hex of the file>", "kind": "document",
                     "file_name": "acme-website-brief.pdf", "converter": "claude-read claude-opus-5-5" },
    "body": "<the converted text, verbatim>" },
  { "type": "source", "title": "Acme launch update (document)", "file_date": "2026-12-06",
    "frontmatter": { "source_key": "url:https://acme.example/news/launch-update", "kind": "document",
                     "converter": "markitdown 0.1.8" },
    "body": "<the fetched page, verbatim>" },
  { "type": "source", "title": "Budget approval from Carlos (email)", "file_date": "2026-12-05",
    "frontmatter": { "source_key": "agent:claude-code/2026-12-05-budget-approval-email", "kind": "email" },
    "body": "<the pasted thread, verbatim>" }
] }
```

- **`kind`:** `document`, `email`, `chat`, `note` or `capture`. Leave it out for minutes.
- **`file_name`** (the name only, no folder) and **`converter`** (`claude-read <model id>`, `codex-view-image <model id>`, `markitdown <version>`, `plain-text` for a `.txt` or `.md` file, `verbatim` for a repo file) are required with a `file:` key.
- **Web page** (0036): `source_key` is `url:<the https URL as given>`; `kind` `document` and `converter` (`markitdown <version>` or `web-fetch <model id>`) are required; no `file_name`.
- **Capture:** `source_key` is `notion:<row page id>`, `kind` is `capture`, `origin_edited` is the row's `last_edited_time`.
- **`summary`** (every kind except minutes, added in the real run of step 6, not the step 3 dry run), in `frontmatter` like every field below: one line on what the source taught. It is the Inbox row's Summary.
- **`digest`** (in `frontmatter`; every kind except minutes, captures and attachments, added with `summary`; decision 0043): the key points by section and the figures and dates as stated, in Markdown. It is the body of the Inbox row.
- **Never send `notion_text`, `notion_parts`, `notion_text_requested` or `keep`:** they are retired (decision 0049) and the CLI refuses them (`INPUT_INVALID`). A whole text to read in Notion is a `whole` Document (§2, "Documents").
- **A linked repo's file** (decision 0042) adds `"repo": "<name>", "repo_path": "decisions/0041-review.md", "commit": "<the listing's to, 40 hex>"` to a `document` with a `file:` key, `file_name` = the path's last segment and `converter: verbatim` for a text file.
- **`only_keep`** (decision 0049; any kind but `minutes` and `capture`, attached files included): what the user asked to keep as a Document, as written (`"only_keep": "just the requirements"`), from the row's Only keep, the drop folder's "only …" or the user's words. Leave it out when the whole input is kept, or none of it. An attached file takes its row's Only keep.
- **`area`** and **`projects`** (decision 0050): the Area and Project the user set on the Inbox row (or the meeting), as brain ids. Each must be an existing area or project, else the CLI refuses the batch (`UNKNOWN_ID`). Leave them out when the row has none.
- **`replaces`** (decision 0045): on a re-read or a new version, the `src-` id of the version it follows. The CLI then dedupes it by content only, and refuses an id that isn't a source or that another source already replaces (`INPUT_INVALID`).
- **A file attached in Notion** adds `"attached_to": "<the parent's src- id>"` to a `document` with a `file:` key, and has no `digest`. The parent must exist already or come earlier in the same batch.
- **Title:** `<title> (<kind>)`; for a web page, `<title>` is the page's own title. **`file_date`:** the text's own date (a document's date, a web page's stated publication or update date, an email's sent date); for a capture, the row's Created date; else today.
- **Dates in the notes:** a new note's timeline `from` is the date the text gives, else the source's `file_date`; `learned` is always today (the day the brain learned it).
- **Duplicates:** the CLI also skips a source whose `file:` key, or whose `capture` row, was already ingested, even if the text differs.

## 2. The new-notes batch

All new notes of one meeting in one call, with ids from `brain id new`. **The complete batch from the real run is [example-batch.json](example-batch.json).** It is valid `note new` input for `tests/fixtures/brain-acme`: the source, meeting, person, two decisions, question and risk, all referencing each other. Only the source body is shortened.

An **excerpt** (not runnable on its own): the meeting and one decision, showing how the pair references each other.

```json
{ "type": "meeting", "id": "mtg-pcpyn31n", "title": "Acme launch review",
  "frontmatter": {
    "summary": "Launch fixed for 15 Feb 2027, Contentful chosen as blog CMS, budget raised to 95000 EUR.",
    "date": "2026-12-10",
    "attendees": ["per-3h8w2n6c", "per-9t2c6m4a", "per-zzvs98vn"],
    "source": "src-vdcsmjex",
    "decisions": ["dec-axker49q", "dec-xe9x6apm"],
    "questions": ["que-wtnyy4r6", "que-zv7ckbtk"],
    "area": "area-2m7c4h8n", "projects": ["prj-9x4t1b7e"], "sources": ["src-vdcsmjex"] },
  "body": "## Summary\n…" }
```
```json
{ "type": "decision", "id": "dec-xe9x6apm", "title": "Use Contentful as the blog CMS",
  "frontmatter": {
    "summary": "Acme's blog runs on Contentful rather than a custom CMS; chosen over Strapi for its editor.",
    "date": "2026-12-10", "assessment": "accepted", "decided_in": "mtg-pcpyn31n", "deciders": ["per-9t2c6m4a"],
    "area": "area-2m7c4h8n", "projects": ["prj-9x4t1b7e"], "sources": ["mtg-pcpyn31n"] },
  "body": "## Decision\n…\n\n## Context\n…\n\n## Consequences\n…\n\n## Sources\n- [Acme launch review, 10 Dec](../meetings/2026-12-10-acme-launch-review.md)\n" }
```

Things the CLI checks that are easy to get wrong:
- **Never set** `id` inside `frontmatter`, or `type`, `title`, `created`, `updated` or `lifecycle`. The CLI sets them, and new notes are `draft`.
- **A decision needs `sources`.** `decided_in` / `raised_in` must agree with the meeting's `decisions` / `questions` lists. Both sides must be in this batch, since the meeting is new.
- **Every `facts` key needs an accepted `timeline` entry with the same value.**
- **Every reference must exist** in the brain or in the batch, and every relative link must resolve. Get the paths from a `--dry-run` first (SKILL.md step 7).
- **The meeting body uses relative links**, e.g. `../people/…`, `../decisions/…`, `../../projects/<slug>/project.md`.
- **Sources (`sources`) of knowledge notes are the meeting id.** The meeting itself cites the source snapshot.

### Documents (decisions 0045, 0049)

A Document is a `reference` note with an `origin` (references/extraction.md, "Documents"). In the same batch as its source when the input is new; on its own for a source already in the brain.

```json
{ "type": "reference", "id": "ref-6p2v8k4m", "title": "Acme website brief",
  "frontmatter": { "origin": "whole", "summary": "Acme's brief for the new website, as sent.",
                   "area": "area-2m7c4h8n", "projects": ["prj-9x4t1b7e"], "sources": ["src-5t8n2v6q"] },
  "body": "<the source's body, byte for byte>" }
{ "type": "reference", "id": "ref-4k8m2q7w", "title": "Acme website: requirements",
  "frontmatter": { "origin": "part", "summary": "The requirements from Acme's website brief.", "projects": ["prj-9x4t1b7e"],
                   "area": "area-2m7c4h8n", "sources": ["src-5t8n2v6q"] },
  "body": "## Requirements\n\n- Login with email\n- Launch in 2027-02\n" }
{ "type": "reference", "id": "ref-9w3c7n2t", "title": "Use Supabase for auth",
  "frontmatter": { "origin": "promoted", "promoted_from": "dec-3f7k9m2q", "summary": "Acme moves auth from Firebase to Supabase.",
                   "projects": ["prj-9x4t1b7e"], "sources": ["mtg-8c4n2p7w"] },
  "body": "Acme moves auth from Firebase to Supabase.\n\n## Decision\nUse Supabase for auth.\n" }
```

- **`origin` is required.** `whole`: `sources` is exactly that one `src-` id and the body is its body byte for byte, or the CLI refuses it; the CLI writes it as `reviewed`, and a second one of the same source comes back in `skipped` as `ALREADY_KEPT` (fine). `part`: a draft that goes in the input's `review_notes` like any new note. `promoted`: `promoted_from` names an existing decision or concept that has no promoted Document yet; it takes that note's lifecycle; `sources` may be left out.
- Leave `whole` and `promoted` Documents out of `review_notes`: they need no Review.

## 3. The proposals batch

```json
{ "proposals": [
  { "kind": "update_fact", "title": "Acme budget: 80000 → 95000 EUR", "target": "prj-9x4t1b7e", "field": "budget",
    "after": "95000 EUR", "why": "Budget raised to 95000 EUR to cover the CMS licence.", "source": "mtg-pcpyn31n" },
  { "kind": "update_fact", "title": "Carlos Ruiz role: Developer → tech lead", "target": "per-9t2c6m4a", "field": "role",
    "after": "tech lead", "why": "Carlos is now tech lead for the website.", "source": "mtg-pcpyn31n" }
] }
```

- **Don't send `before`;** the CLI fills it from the current fact. **`from`** (only `update_fact` and `contradiction` have one): leave it out for a meeting (the CLI uses the meeting's date). For any other source, send it: the date the text gives for the change ("approved on 5 December 2026" → `2026-12-05`), else the source's `file_date`; otherwise the CLI would use today.
- **`add_link`** (decision 0028) adds one value to a list of an existing note. Send one item per link, each with its own `title` and `why`: the CLI groups the items with the same `target` and `source` into one proposal, one Review row (decision 0037), and writes the group's title itself:
  ```json
  { "kind": "add_link", "title": "Acme website: add Lucía Fernández to People", "target": "prj-9x4t1b7e", "field": "people",
    "after": "per-zzvs98vn", "why": "Lucía Fernández (Acme, marketing lead)", "source": "mtg-pcpyn31n" }
  ```
  `field` is one of `aliases`, `tags`, `projects`, `people`, `attendees`, `deciders`. A value that is already listed is skipped as `ALREADY_LINKED`.
- **`why`** is the sentence from the minutes, verbatim.
- **`title`** reads as a Review row: `<subject> <field>: <old> → <new>`.
- **Other kinds** (spec/schema.md §11):
  - `add_to_note`: `target`, `content`. A link in `content` is relative to the target note's folder.
  - `update_body` (decisions 0045, 0049): `target` = a Document (`reference` note) whose `origin` isn't `promoted`, `content` = its whole new body, every unchanged line copied exactly. The CLI stores the old body's hash, so a body changed meanwhile is caught as stale, and refuses a `content` equal to the body (`NO_CHANGE`).
  - `contradiction`: `target`, `field`, `after` (the target must have a current value).
  - `supersede`: `target` = the new note, `supersedes` = the old one.
  - `merge`: `target` = the duplicate, `merge_into` = the survivor.
  - `new_item`: `note`, a `note new` item without `id`, for a decision or question of a meeting that already existed.
- **`review_notes`** (decisions 0041, 0043, 0045): one per input, in the same batch as its `add_link`, `update_fact`, `update_body` and `add_to_note` items, which the CLI folds into it as lettered items (changes first, then notes, then links):
  ```json
  { "kind": "review_notes", "source": "mtg-pcpyn31n",
    "notes": ["mtg-pcpyn31n", "per-zzvs98vn", "dec-axker49q", "dec-xe9x6apm", "que-wtnyy4r6", "que-zv7ckbtk"] }
  ```
  `source` is the meeting id for minutes, else the source's id: the same value the batch's other proposals carry. `notes` lists every knowledge note `note new` created for this input (never the source), or is `[]` when it created none (a re-read). The CLI writes the title ("From Acme launch review: 1 change, 6 new notes and 2 links"). A note can be in only one `review_notes`. The reply's `created` has one proposal for all of them; folded items are not listed separately.
- **`answer`** (decision 0041), on an open question the input answers:
  ```json
  { "kind": "answer", "title": "Who owns the mobile app: Carlos Ruiz", "target": "que-8n3v5x1d",
    "answer": "Carlos Ruiz owns the mobile app.", "answer_note": "dec-axker49q",
    "why": "Carlos takes over the mobile app from January.", "source": "mtg-pcpyn31n" }
  ```
  `answer_note` only when a note answers it (usually a decision of this batch). A question that already has an answer is skipped as `ALREADY_ANSWERED`.
- **A re-run is safe:** identical pending proposals are skipped as `DUPLICATE_PENDING`.

## 4. Action items (Notion mode)

From a meeting:

```json
{ "items": [
  { "title": "Set up the Contentful space", "owner": "Carlos Ruiz", "due": "2026-12-17", "projects": ["prj-9x4t1b7e"] },
  { "title": "Write the blog launch post", "owner": "Lucía Fernández" }
] }
```

`brain sync tasks --meeting mtg-pcpyn31n --input <file>` turns these into Notion payloads using the Tasks mapping in `brain.json`. Leave out `due` when the minutes say "no date". `projects` is the project ids the task is about; leave it out when the task is about the meeting's own project(s), and the meeting's projects are used.

From any other source, the owner's tasks only ([extraction.md](extraction.md), "Tasks for the owner"); no `owner`:

```json
{ "items": [
  { "title": "Send Carlos the migration plan", "due": "2026-12-05", "projects": ["prj-9x4t1b7e"] }
] }
```

`brain sync tasks --source src-5t8n2v6q --input <file>`. A task with no `projects` gets no project. Its backlink is the source's Inbox row: until that row is published, the item lists it in `pending_relations`, so publish the source first ([notion.md](notion.md), "Publish").

## 5. Log line

```sh
brain log ingest mtg-pcpyn31n created=7 proposals=3 tasks=2 --brain <brain> --json
```

- **`created`:** the number of notes `note new` wrote, the source included.
- **`proposals`:** the number `proposal new` created; skips don't count.
- **`tasks`:** the number of Notion tasks created, 0 in Markdown-only mode.
