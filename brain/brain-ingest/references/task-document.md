# Keep a task as a document (decision 0100)

What a task gathers (the research done for it, the answer to the question it tracks) can be kept: the task page becomes a source, then a whole Document, and you offer what the brain already holds on the subject in one section at its end. The contract is spec/capture-and-review.md §13.

*(Documents)* It needs the Documents module. With it off, nothing is kept: say "Documents is off, so the task can't be kept" and offer "turn on documents".

## Two ways

- **In the session:** "keep the go-live task as a document". Find the task by its title in the Tasks database through the MCP (ask which one when several match), say what you will write ("I'll keep *Check go-live with hosting* as a document in Website refresh"), and write it on the user's yes. Any task can be kept, tracked or not, whatever the Tasks module.
- **With the flag:** the **Keep as document** button on a task ticks **Document asked**. The next catch-up keeps it and clears the box (brain-catch-up step 5; `sync plan` lists it as a `task_documents` item `{ "page_id", "title", "projects", "area", "question", "source", "existing" }`).

## Keeping it

1. **Read the page** through the MCP: its Name, its Project and Area relations, and its body as Markdown. An empty body has nothing to keep: say so ("nothing to keep on *Check go-live with hosting*"), and clear a ticked box.
2. **The source** ([cli-inputs.md](cli-inputs.md) §1b, "A task page"): key `notion:<task page id>`, `kind: task`, title the task's Name, body the page body **word for word** (the properties are not part of it), `area` and `projects` the task's Area and Project mapped to the brain's notes by their `notion` (a page the brain doesn't know is left out; a `task_documents` item already gives them). No `notion`, no `digest`, no `only_keep`: the page is the task's, in Tasks, and has no Inbox row.
3. **The Document,** in the same `note new` batch: `origin: whole`, `sources` exactly the task source, its body the source's body byte for byte, and:
   - `area` and `projects` the source's;
   - `question`: the question the task tracks, when there is one: the open or answered question whose `task` is this page (the `task_documents` item's `question`, or in the session the entry of `brain sync tracked` with this `page_id`);
   - its title the task's Name. The CLI writes it `reviewed`: it is the user's own text, not the brain's claim.

   In Notion the Documents row's **Task** relation points back to the task when it is published (Tasks off: no relation).
4. **Publish** the Document (`sync render --changed`, MCP, `sync record`), then untick Document asked on the task through the MCP. Nothing else of the task is read or changed: its status, due date and relations stay the user's.

## Kept again

`note new` dedupes a task source by its key:
- **The page has not changed:** nothing is written (`DUPLICATE_SOURCE`, and the Document `ALREADY_KEPT`). Say it is already kept, and ask the From the brain question again, with only the candidates its section doesn't hold yet. A ticked box is cleared.
- **The page changed:** write a new version of the source, `replaces` = its latest version (the item's `source`, or the source keyed `notion:<page id>` followed forward along `replaces`, sources.md "Re-reads"), and propose an `update_body` on the Document: `content` = the new page text, then the Document's From the brain section as it is now (read with `brain query --read <ref-id>`), every line copied exactly. It replaces what the brain holds, so it is asked: in the session at once, showing the changed lines (`brain source diff <new src-id>`); after a run without the user, as a waiting question. The Document never changes without the user's yes.

## From the brain

After keeping it, ask one question: whether to add what the brain already holds on the subject. Candidates, at most five, each one line that says what the note holds on the subject, with its title:
1. the tracked question's answer, when it has one (read the question with `brain query --read`: cite the question, or its `answer_note`);
2. the decisions, Documents and other notes `brain query --candidates "<the task's title>" --limit 5` returns, read with `brain query --read`. **Eligible only:** a note in its awaiting-cleanup form is no candidate (a line couldn't name it), and neither is this Document or its source.

```
Keep "Check go-live with hosting" as a document: done (Website refresh).
From the brain, add to its end?
  a) The site goes live on 4 March in three regions (decision: Go-live date)
  b) Hosting contract renewed to March 2028 (Document: Hosting contract)
  All, all except …, none, or later?
```

No eligible candidate: no question.

The lines the user says yes to are **one** `add_to_note` with `"section": "from_the_brain"` ([cli-inputs.md](cli-inputs.md) §3, "From the brain"), approved in the chat at once (`brain apply`, `decided_by: chat`, `note` = the user's words). Each line is `- <text> ([<title>](<relative link to the note>))`, the text written from what the read returned, and `passages` lists every cited note's id and the passage references of the lines it restates. Approving adds them at the end of the Document, under **From the brain**; the user's text above is never changed:

```markdown
<the task page's text, word for word>

<!-- from-the-brain -->
## From the brain

- The site goes live on 4 March in three regions ([Go-live date](../decisions/2026-11-02-go-live-date.md))
```

- **None:** nothing is written.
- **Later:** write the `add_to_note` with every candidate and leave it pending; it is asked with the waiting questions (brain-apply).
- `ALREADY_ADDED` in `skipped`: those lines are already in the section. Fine.

Then rebuild, check, commit (`documents: keep task <title>`) and publish the Document again.

## Without the user

A scheduled catch-up that finds a ticked Document asked keeps the task right away (the user's own text needs no decision), clears the box, and writes the From the brain `add_to_note` pending, with every candidate, for the next session (no candidate: none). A changed page kept again writes its `update_body` pending. With Documents off the box stays ticked (`MODULE_OFF`).

## Example

The brain holds the open question "Can the site go live by the end of March?", tracked by the task *Check go-live with hosting* in Website refresh. The user writes their findings on the task page, then says "keep the go-live task as a document". You read the page, write the task source and the `whole` Document (`reviewed`, Website refresh, `question` = that question), then ask From the brain. On "a", one `add_to_note` adds the line citing the go-live decision, approved in the chat. The publish creates the Documents row with Project Website refresh and Task the task page.
