# A changed document, checked before it goes in (decision 0098 §4 to §7)

When the user wants a document changed before it goes in, you write the changed text to a **checked row**: a new Inbox row linked to the original. Nothing is taken in until the user has checked it. The contract is spec/capture-and-review.md §12, the command spec/cli.md §5.35 (`brain source check`).

## What it applies to

An input of kind `document`, `email`, `chat` or `note`: a converted file (an attached file and a drop-folder file included), a web page, a pasted thread or a text given in the session. Never minutes or a capture, and never a task page (that is [task-document.md](task-document.md)):
- **Minutes** keep Check minutes and Reviewed. A change asked on a meeting is made on its page: say so ("fix it on the meeting page, then set it Reviewed").
- **A capture** (a row the user created) keeps Tidy capture: the user edits the row before setting it Ready. On a capture, Only keep applies to its attached files only. A capture with no file and Only keep filled is kept whole: say so under Check ("Only keep applies to attached files; *Pilot notes* was kept whole").

## What writes a checked row

- **A change asked in the session** before the input goes in: "keep only the requirements, as a spec", "drop the appendix", "the depot count is 11, not 9". On an input about to go in (a dropped file, a Ready row's attached file, a pasted text) or on one the brain already has ("keep the budget section of the Acme brief as a document").
- **Keep as document with Only keep filled** (decision 0049): on a Ready row's attached files, on a row the brain already took in (a `document_requests` item with `only_keep`), and for a drop-folder file answered "only …". The part Only keep names becomes the row, with Document asked ticked. **Only the kept part goes in:** the original is recorded as a source only, and What changed lists what was left out, so the user sees it before the part goes in.
- **Keep as document with Only keep empty** writes no row: the whole input is kept as a `whole` Document (extraction.md, "Documents").

A `part` Document is never written: the CLI refuses `origin: part`. A part is always a checked row.

## Writing the row

One turn, nothing taken in. The preview before the write names the changes; the user's yes covers the Notion writes of steps 1 and 3.

1. **Record the original as a source,** when the brain doesn't have it yet: `brain note new` with the source item alone ([cli-inputs.md](cli-inputs.md) §1b), no note, no proposal, no Task. Then publish its Inbox row as for any source: `brain sync render --ids <src-id>`, write it through the MCP, `brain sync record`, in that order before step 3 (the row needs the original's page). A file **attached to a row** has no row of its own: its capture's row stands for it. When that row is Ready and not taken in yet, record the capture and every file attached to it in the same `note new`, then render and record the capture's row, so it becomes Done with its Brain ID and no run takes it in again. Nothing of the capture's own text is taken in either. An original the brain already has keeps its source and its row.
2. **Write the changed text.** What the user asked for, or the part Only keep names, in the original's order and wording: every figure, date and name exactly as the original states it, nothing added that the original doesn't say, except a value the user gave ("11, not 9"). Then list what the change dropped or altered compared with the original, one line each: `Dropped: Appendix B (pricing)`, `Altered: depot count 9 → 11`.
3. **Render the row:** `brain source check --input <file>` with
   ```json
   { "original": "src-4m9q2x7c", "file": null, "title": "Ops plan (changed)",
     "text": "## Pilot\nThe pilot covers 11 depots in three regions…\n",
     "changes": ["Dropped: Hiring (section 3)", "Dropped: Appendix A (budget)", "Altered: depot count 9 → 11"],
     "document_asked": false }
   ```
   `file` is the attached file's `file_name` when the original is a file on a row, else `null`. `document_asked` is true for Keep as document, or when the user asked to keep the changed text as a Document (with Documents off the CLI refuses it: say the module is off). The title is the original's title without the kind, then `(changed)`. It writes nothing: create the page in the Inbox through the MCP from its `properties` and `body`, as one write with its final content (notion.md, "One write, final content"). Nothing is written in Git for the row.
   - `ORIGINAL_NOT_PUBLISHED`: step 1's row isn't recorded yet. Publish and record it, then run `source check` again.
4. **Tell the user,** in one line: "I wrote the changed version to your Inbox: *Ops plan (changed)*. Check it there and edit it if you want, then say *go*, or set it Ready for the next catch-up."

**One waiting row per original.** Before writing a row, look for one already waiting for the same original (below, "Finding the rows"). A further change asked while it waits is made to that row: show the new text and What changed, and on the user's yes replace the row's body and What changed through the MCP. A change asked after the row went in is a change to the checked source: a new checked row whose original is that checked source.

**A drop-folder file** answered "only …" is recorded (step 1, with its `only_keep`), its row written, and then moved to `processed/` like any file the brain has.

## Finding the rows

A checked row is an Inbox row with **Changed from** set and no Brain ID. Changed from is the one marker: Kind Changed set or removed by hand doesn't change what a row is. Query the Inbox for rows with Changed from not empty and Brain ID empty. Those with Brain Status New wait for the user's check; those set Ready are inputs.

**Its original:** the source whose `notion` is the row's Changed from page, an administrative lookup (`grep -rlE "^notion: <page id>$" <brain>/sources/`; it gives an id, nothing more). When What changed starts with `File: <name>`, the original is the source with that `file_name` whose `attached_to` is that source. No source, or more than one: `CHECKED_FROM_UNKNOWN`. In a session, ask which original it is; a catch-up without the user skips the row and names it under Needs you.

## Taking it in: "go", or Ready

**"go"** in the session: find the rows waiting (Changed from set, no Brain ID, Brain Status New or Ready). With several, ask which one. Then, as for a Ready checked row in a catch-up:

1. **Read the row as it is now,** edits included: its page body as Markdown, What changed, Project, Area, Document asked and `last_edited_time`.
2. **Write its source** with `brain note new` ([cli-inputs.md](cli-inputs.md) §1b, "A checked row"): key `notion:<row page id>`, the original's `kind`, `checked_from` = the original's source id, `changes` = What changed's lines without the `File:` line, `notion` = the row's page id, `area` and `projects` from the row, the body read from the page, `origin_edited` = its `last_edited_time`. When the brain already has a source with that key (the row went in before, then was edited and set Ready again), add `replaces` = its latest version (sources.md, "Re-reads"); the same text is `DUPLICATE_SOURCE`, and nothing more is done for it. Give it a `summary`; no `digest` (its body is the user's).
3. **Ingest it by subject,** as for any document (sources.md steps 4 to 7, SKILL.md steps 8 to 11): each part's short view, what it adds, its questions, its yes. **Every item cites the checked source**, never the original: its passages are that source (`passages: ["<its src- id>"]`). The CLI refuses a note or proposal that cites the original (`CHECKED_ORIGINAL`): cite the checked source instead. The original stays linked by `checked_from`.
4. *(Documents)* **With Document asked ticked,** the same `note new` batch writes a `whole` Document of the checked source, `reviewed`: it is the text the user checked, word for word (extraction.md, "Documents").
5. **Publish** (notion.md "Publish"): the row gets its Brain ID, Brain Status Done and Summary. Its Name, body, Kind, Changed from and What changed are the user's and the brain's first write: `sync render` never sends them again, and you never rewrite them. Untick Document asked on it through the MCP once its Document is written.

In the parts, open with one line naming what the row changed: `Ops plan (changed), checked by you: Dropped Hiring, Appendix A; depot count 9 → 11.`

**Ready.** The user sets the row Ready, and the next catch-up takes it in like any Ready row: attended, as "go". Without the user (brain-catch-up references/unattended.md), only once its page has settled for 2 minutes (`TOO_FRESH` otherwise); its new notes stay `draft` and its parts and questions wait for the next session. **Ready approves the text, not the notes.** A `whole` Document of the row is `reviewed`, since it is that text and nothing else.

## Never taken in twice

- **The original** is never taken in once its checked row exists: its row is Done, so no run takes it in as Ready, and nothing of it is extracted. An original the brain took in before the change was asked (Keep as document clicked on a row already in) keeps what it gave: the checked row's items are matched against the brain like any ingest's, and only what is new is added.
- **The original set back to Ready while its row waits:** skip it, and name it under Needs you: "*Ops plan* has a changed version waiting for your check". To take in the whole original instead, the user says so: on their yes, move the checked row to Notion's trash, then take in the original (its source is in the brain, so read it as sources.md "Re-reads" says).
- **The row itself** is deduped by its key: read again with the same text it is `DUPLICATE_SOURCE`; set Ready again after an edit, it is a new version with `replaces`.

## A row never confirmed

Nothing is taken in: the row stays New, and only the original's source is in the brain. An attended catch-up names the rows waiting under Needs you: "1 changed document waiting for your check: say *go*, or set it Ready". An unattended run doesn't. To drop it, the user deletes the row; nothing else changes.

## Unattended

A run without the user writes a row only for Keep as document with Only keep filled, and only with `settings.publish: auto`; with `ask` the request waits, its box ticked and its row Ready. It never writes one from a change asked in words, since nobody asked. A Ready checked row is taken in as above.

## Example

The user drops `ops-plan.pdf` in the session: "take it in, but keep only the pilot section, and the depot count is 11, not 9".
1. You record the PDF as a source, publish its Inbox row (Done), and write *Ops plan (changed)*: Changed from the PDF's row, What changed `Dropped: Hiring (section 3)`, `Dropped: Appendix A (budget)`, `Altered: depot count 9 → 11`, Brain Status New, the pilot section as its body. Nothing else.
2. In Notion the user fixes a date in the row's body.
3. Next day: "go". You read the row, edit included, write its source (`checked_from` the PDF's, `changes` the three lines) and show one part, Pilot rollout, with Q1 on the depot count (9 → 11, citing the row), then "Accept?". The items go in citing the row's source; the PDF's source is cited by none and is reached through `checked_from`.
