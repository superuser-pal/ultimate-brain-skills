# Selected input: what enters the brain (decision 0055)

Read this when the summary of a meeting or a capture has subjects and item ids (`[s1] …`, `[s1.i1] … "quote"`; notion/minutes-format.md, notion/voice-format.md). The user decides what enters the brain by marking subjects or items `Meeting only`; the brain stores **only the selected paragraphs of the transcript** as an extract and builds every note from that. Contract: spec/capture-and-review.md §3, §4, §6; commands: spec/cli.md §5.22, §5.23.

**Which flow?** A summary with **no** `[s…]` id anywhere (a meeting summarised before this format, or by another tool) is a *legacy summary*: ingest it whole by the procedure in SKILL.md, unchanged, and add to **Check**: "<title>: no subjects or ids, so nothing could be left out". A summary with ids is read by this file. Never ingest the whole transcript because a selection failed.

## 1. Confirmed? (both modes)

- The input counts only when its status is **Reviewed** (Meetings) or **Ready** (Inbox). Reviewed/Ready confirms the selections the page shows when the first run that sees it reads them, and nothing else. A New or Not Reviewed input is unconfirmed: never read, never ingested, and **never set to Reviewed/Ready by you** (an unattended run in particular).
- An **unattended** run takes a confirmed input only when the page's `last_edited_time` is at least **2 minutes** older than the run; otherwise it waits (`TOO_FRESH`) and is named under Needs you. Its report says that an edit made in the confirming minute cannot be detected.

## 2. Read and plan

1. Read the summary and the transcript of the page through the Notion MCP (the meeting's transcript tool for a meeting; the **Transcript** toggle for a capture). Write them verbatim to two temporary files outside the brain.
2. Is this the first read? Look for sources of the page: `grep -l "notion:<page id>\|extract_of: <page id>" sources/*/*.md` (frontmatter `source_key`, `extract_of`). If there are any, pass `--previous <the latest one>`: the source that no other source names in `replaces` (for an input ingested in full before selection, its latest non-extract source). Without it a second read stops with `PREVIOUS_REQUIRED`; a wrong pick stops with `NOT_LATEST`.
3. Run `brain source extract-plan --page <page id> --summary <file> --transcript <file> [--previous <src>]`. Read `data`:
   - `ok: false` → **blocker** (below). Nothing may be written.
   - `copied`: the full text of every paragraph that would enter, with the items citing it. `uncovered`: the number of paragraphs no item cites (they do not enter). `unnumbered`: list lines with no id (a blocker). `problems`: `DEPENDS_ON_EXCLUDED` items are listed, not blocking.
   - `write_required` (top level; `false` means `UNCHANGED`: no new version; go on to Tasks, §6);
   - with `--previous`, under `data.previous`: `transcript_changed`, `suppressed`, `added`, `selection_changes`, `legacy_tasks`, `full_copies`.

## 3. Blockers

`SELECTION_UNREADABLE` (a token spelled wrongly, a control in the wrong place), `SELECTION_UNMAPPABLE` (a quote found in no paragraph or in several, more than three, longer than twelve words, a missing `depends on` id or a cycle, or "shares a paragraph with excluded content"), `UNNUMBERED_LINE`. The input is a blocker, not a partial ingest.
- **Attended:** show each problem with its line, and offer the **repair** for unmappable items: propose longer quotes (copied from the transcript, at most twelve words, unique) or tighter ones that cite a different paragraph, for the user to confirm in the preview. For an unnumbered line propose an id and quotes. Apply confirmed repairs to your temporary summary file only (never edit the Notion page's tokens or text), then run `extract-plan` again, and tell the user to fix the same lines on the Notion page (ask Brain Assistant to "check minutes"): the page keeps the old text, so the next read blocks again until they do. For a collision between an excluded and an included item, say which two items collide; if the shared words cannot be separated, the input stays blocked.
- **Unattended:** skip the input and name it and the line under Needs you.

## 4. Preview, then write (attended)

Show, before anything is written: every subject and item with its **effective selection** (the item's own token, else its subject's, else use), the **full text of each paragraph that will be copied** with the items citing it, the paragraphs covered by no item ("n paragraphs are covered by no item"), the unnumbered lines, the items listed "depends on excluded context", and, with `--previous`, what changes (`suppressed`, `added`, `selection_changes`, `transcript_changed`). A transcript change suppresses every paragraph of the old version: say so. Import only after a yes.

Then run `brain source extract --page <id> --title "<title>" --date <YYYY-MM-DD> [--kind capture] --summary <file> --transcript <file> [--previous <src>]`. It writes the extract, its suppression record and the regenerated views as one journaled, committed operation. `UNCHANGED` means nothing to write. On `RECOVERY_NEEDED`, run `brain recover` and stop if it fails.

**Unattended:** a first version of a confirmed, settled input is written without a preview. A re-read that changes the transcript is skipped (it suppresses everything) and named under Needs you; a re-read with the same transcript is written only when the page is settled, and the report names the suppressed and added paragraphs.

## 5. Ingest from the extract

The extract is the source; do **not** `note new` a source (that stops at `DUPLICATE_SOURCE`). Run steps 4–11 of SKILL.md with the extract's id as `source` and read **only the extract's paragraphs** (the transcript and the rest of the summary stay in Notion). Every claim you write cites its paragraph:
- in a note body, a marker `^[src-…#¶n:<passage_hash>]` after the statement; in a timeline entry, the field `passage` (`src-…#¶n:<hash>`); the hash is in the extract's `passages`. `brain lint` requires it;
- an item with `context_excluded` (explicit `use` whose context was excluded) makes each claim from it carry `context_excluded: true`, and Review shows it;
- an excluded item, or an item "depends on excluded context" without its own `Use in brain:`, creates **nothing** anywhere: not a note, a fact, a Task, a link or a report line.

A re-read runs the ordinary comparison on the extract's paragraphs (SKILL.md, "A re-read"): corrected wording supersedes the old statement, and only changes without a pending or decided proposal for the same target become Review items, so a second run finds nothing new.

**No durable knowledge is a valid result:** write the extract, propose nothing, say so.

## 6. Tasks

With the Tasks module off or no Tasks database configured (`brain status`), write no Task items and say nothing about them; the summary and the notes are written as usual.

Only the owner's **explicit** commitments become Tasks. The owner comes from the configured identities and aliases (`brain.json` `owner`), never from a name in a prompt. Take them from numbered items that are effectively selected, of a confirmed input.
- An ambiguous owner, "needs clarification", or a tentative idea ("we could…") → **no Task**. Say so under Check.
- Another person's commitment → **no Task**, unless the item carries `Track: Waiting On —`. Then `brain sync tasks --source <extract> --input` takes `{ "title", "status": "waiting_on", "owner": "<their name>", "item": "s1.i3" }`; the summary's `Track` token is the user's explicit request, you never add it. If `brain.json` `notion.tasks.properties.owner` is empty the person's name cannot be stored: tell the user, and start the title with "Waiting on <name>: " yourself. Offer it once in the preview ("Maria said she will send the plan: track it? write `Track: Waiting On —` before that item") but create nothing until the token is on the page.
- **Selected inputs use `brain sync tasks --source <the extract's src id>`, for owner Tasks too** (`--meeting` refuses an `item`). Each item is `{ "title", "item": "s1.i3", "projects": [the meeting's or the row's project ids], "due"? }`: `--source` does not copy the meeting's projects, so pass them yourself; it sets no Meeting relation (the Task links to the extract's Inbox row). Every owner Task carries `"item": "<item id>"`. Record the Task with `brain sync record` including `task_items` (`{ "<item id>": "<Notion task page id>" }`).
- **Never twice:** an item with an entry in `task_items` anywhere along the `replaces` chain gets no second Task. While `legacy_tasks` is not empty create **none** automatically: list the item as "possible Task" with the existing Tasks' links; an attended run creates it only after the user confirms, an unattended run skips it and names it under Needs you. Never cancel or delete a Task.

## 7. Changes after ingestion

The brain does not watch ingested pages: deleting a line in Notion is not a request. The user asks by setting the meeting back to **Reviewed** (the Inbox row to **Ready**) after editing the tokens, or by telling you. Then follow sections 2–4 with `--previous`, and run the ordinary ingest comparison (SKILL.md, "A re-read"). Setting the status again is also how the user asks the brain to check the input against what it already knows.

When an extract version suppresses or re-includes paragraphs, claims resting on them are restricted at once. After the version is written and committed, run `brain source cleanup-propose --page <id>`: it writes one **Exclusion cleanup** Review row (Remove, Restore, Keep/Remove items). Unattended, this is only an addition; nothing is removed. Tasks created from excluded content are listed in the row; you never cancel them.

## Report

Under Check: unconfirmed inputs left waiting, blockers with their lines, paragraphs covered by no item, items "depends on excluded context", legacy summaries that could not be narrowed, the confirming-minute limit (unattended), and Tasks listed as "possible".
