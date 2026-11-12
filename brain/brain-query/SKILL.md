---
name: brain-query
description: Answer a question from the user's second brain with citations, such as what was decided and why, who someone is, a date, budget, owner or other key fact, what changed and when, or what a rule was before it changed. Works from the brain repo or any repo linked to it with `brain link`. Read-only, except its report mode, which writes a report, refreshes it in place and publishes it to the Inbox. Use when the user asks "what did we decide about…", "why did we…", "who is…", "when is the launch…", "what do we know about…", "report on…", "where do we stand with…", "refresh the Acme report", when an Ask row is waiting in the Inbox, a Report row has Refresh asked ticked or a What to fix, or when the repo's "Ultimate Brain" block says to consult the brain before a decision. Also the user's memory, loading the opening recall pack at the start of work, "remember this", and the closing review when the user says "wrap up", "let's close" or "end of session".
---

# Answer from the brain

Find the notes that answer the question, read them through the CLI, and answer briefly, citing the notes. **Read-only:** never write to the brain from this skill, except a report in report mode, the log line each answer or report adds (below), and the memories the user approves in the closing review ([references/memory.md](references/memory.md)). If the user wants an answer saved as knowledge, that is a separate step (an ingest or a proposal), done only when they ask.

## Where the brain is

If `brain` is not found (`command not found`), install it with `npm install -g ultimate-brain`, then retry.

- **In the brain repo:** run `brain <command> --brain . --json`.
- **In a linked repo** (it has a `.brain` file and an "Ultimate Brain" block in AGENTS.md): run `brain <command> --json` without `--brain`. The CLI finds the brain through `BRAIN_DIR` or `~/.config/ultimate-brain/config.json`, and reads `.brain` in the current folder to favour that repo's project.
- **If the CLI exits 3** (`BRAIN_NOT_CONFIGURED`, `BRAIN_NOT_FOUND`), tell the user the brain isn't configured on this machine and stop. Don't search the disk for it.
- **If the CLI exits 2** (`USAGE`) on a query, the command or the folder's `.brain` is wrong, not the brain: show the user the message as printed (it names the folder and the allowed keys when `.brain` is the cause) and stop. Never edit `.brain` by hand and never work around it with `--brain`: `brain link <path>`, run from the brain, rewrites it.

## Procedure

Tasks with the mapped `notion.tasks.wont_do_status` (default "Won't Do") are dropped, not open work. Mention them only when asked about dropped or closed work; distinguish them from completed tasks.

Content the user excluded from the brain (a subject or item marked Meeting only, a paragraph removed in a later version of its input) is not returned: `brain query` leaves the restricted claims out, and so do the derived views. Answer from what is returned, never from memory of an excluded statement, and never quote a note body statement that carries only restricted references.

**Only the CLI knows what you may use.** The brain's files also hold statements the user excluded, memories nobody approved and memories meant for another project or stack. `brain query` and `brain recall` leave those out; a file you open or grep does not. So for an answer, a note counts only when `brain query` returned it and a memory only when `brain recall` or `brain query --read` returned it. Do not search, list or open the brain's files yourself (no grep, find, ls, cat or file read under the brain's folders), and never quote, cite or summarise something found that way, not even with a caveat such as "unconfirmed" or "this belongs to another project". **A listing is not evidence either:** what `brain index --json`, `brain status`, `brain proposal list`, `brain lint`, `brain log` or any other administrative command prints (an id, a title, a summary, a memory's line) is for running the brain. Never answer, summarise or cite from it, and never use it to fill a gap that `brain query` or `brain recall` left. Don't explain why a line or a note is missing, or guess what it said; if the user asks why, say "restricted: awaiting cleanup". This doesn't cancel what steps 2 and 4 require you to say: that the brain withholds a note the answer needed (its id only), and a note's `cite` label. Reflection and reports do not treat restricted claims as a signal or as evidence.

**Present or past.** A question about how things are now gets current memories only, never the two historical forms below. Only a question about the past ("what was the rule before?", "why did we use to…?") reads memory history, and only through those two forms: `brain recall --search "<the question>" --include-superseded --json`, then `brain query --read <mem-id>,<mem-id> --historical --json` when you need a replaced memory's whole text. A replaced memory comes back with `superseded_by`, and from the read with `"historical": true`: read the memory it names with a plain `brain query --read`, and answer with both, saying the old one is history: "Your rule used to be 'run migrations freely' (historical, mem-7c2n9x4t); it was replaced by 'ask before running migrations' (mem-3k8d2m4q)." A replaced memory is never stated as the current rule. A superseded knowledge note (a decision replaced by another) needs neither form: the default reads return it, labelled (step 2).

1. **Search.** Run `brain query --candidates "<the question, in the user's words>" --json`.
   - **Search a name as the user wrote it** (a person, client, project) before answering from memory, even when you think you know who they mean: the brain may hold that spelling with other facts, or a person you've never heard of with the same first name.
   - Add `--types decision` (or `person`, `project`, `question`, …) when the question is clearly about one kind of note.
   - Read each candidate's `title`, `summary`, `assessment`, `lifecycle` and `snippets`. **Usually this is enough to choose what to read in step 2.**
   - A candidate in its **awaiting-cleanup form** has `title`, `path` and `summary` `null` and a `cite` label instead (`decision dec-2p9f6h1r, title withheld: awaiting cleanup`): part of it is excluded, so the brain doesn't show its name. Choose it by its snippets and read it like any other.
   - **Search matches whole words from their start.** If the top candidates miss, search again with abbreviations expanded or reversed ("PM" ↔ "product manager", "CMS" ↔ "content management"), with a person's other names, or with the client's name.

2. **Read** the full text of the few notes that answer it, usually 1–5, with `brain query --read <id>,<id> --json` (up to 20 ids; add `--brain .` in the brain repo). Each note comes back as retrieval may use it: `body` and `frontmatter`, with an excluded line returned as blank spaces. `restricted: true` means something was left out: answer from what is there and don't guess the rest. A note in its awaiting-cleanup form (`title` and `path` `null`, `cite` given) also has its headings blanked, except a decision's fixed sections: use the lines that are there. A note with `status: "withheld"` is not evidence: never open its file, and don't tell the user what it might say. If the answer needed it, say that the brain withholds that note (its id, nothing more) and answer from the rest; no file, listing or other command stands in for it. Follow the links the question needs, reading each linked note by its id the same way:
   - **A decision:** read its `## Decision` and `## Context`. For "why", also read the meeting in `decided_in` (by its id, with `brain query --read`), and if the reason isn't there, the meeting's source snapshot (the `src-` id in its `sources`), which holds the minutes verbatim.
   - **A `superseded` decision, or a note with a `superseded_by` relation:** follow it to the current note. Answer with the current one, and mention the old one as history.
   - **A fact** (date, budget, role, owner): read the note's `facts` for the current value, and its `timeline` for when it changed and from which meeting.
   - **A person:** their note's `facts.role` (current) and `org`, and the meetings that list them in `attendees`.
   - **Status, priority or progress:** these live in Notion. Use `notion_fields` and say "as of <`notion_fields.as_of` date>".

3. **If nothing fits:** before saying the brain has nothing, retry through the CLI with other words (a person's alias, the client's name, a synonym): `brain query --candidates` again, and `brain recall --search "<words>" --json` for lessons (AGENTS.md rule 2: search before claiming absence). For a question about the past, the memory retry keeps `--include-superseded`; for a question about now, it never adds it. If there is still nothing, say the brain does not hold it, and say what you searched. That is a complete answer: do not go looking in the files, list the brain's folders, or take an id or title from `brain index --json` or another listing.

4. **Answer.** Lead with the answer in one to three sentences, then the evidence.
   - **Cite every claim** by what `brain query` returned for the note, and with the meeting and date for decisions and facts:
     - an eligible note: its `title` and `path`: "Decided at the Acme sync on 2026-12-03 ([Use Supabase for auth](knowledge/decisions/2026-12-03-use-supabase-for-auth.md))". Use links relative to where you are, or plain paths.
     - a note in its awaiting-cleanup form: its `cite` label as returned, with no title or path: "Vendor stays Acme (decision dec-2p9f6h1r, title withheld: awaiting cleanup)".
     - never a title or path the read didn't return: not one you remember, saw in a listing, a view or Notion, or worked out from the note's id or lines. The meeting is named as its own read returned it.
   - **Label trust**, from the frontmatter and markers:
     - `accepted`: state it plainly.
     - `provisional`: "tentatively", "mentioned once, not confirmed".
     - `contested`: give both values and their sources; don't pick one.
     - `superseded`: "was X until <date>, replaced by Y".
     - A replaced memory (`superseded_by`, and `historical: true` from a read): "your rule used to be X (historical); it was replaced by Y". Only in an answer to a past question.
     - Lifecycle `draft`: the user hasn't reviewed this note yet. Say so if the answer rests on it.
     - Lifecycle `disputed`: the user marked it wrong. Say so, and don't rely on it.
     - A sentence ending `^[inferred]`: say it is the brain's inference, not something said in the meeting.
     - `^[ambiguous]`: the sources were unclear.
   - **Separate what the brain knows from your own reasoning.** If you add advice, mark it as yours.

5. **Log it,** from the brain repo only: `brain log query - notes_read=<n> seconds=<s>`, where `n` is the number of notes you read with `--read` and `s` the seconds from the question to the answer (decision 0045). The log is the brain's own record; it needs no commit of its own and goes in with the next one. In a linked repo, skip this step.

## Memory: recall, "remember this" and "wrap up" (decision 0074)

When the repo's "Ultimate Brain" block has the recall paragraph, load `brain recall --pack --json` at the start of work and read it silently. When the user says "remember this", or "wrap up" at the end, run the closing review: record where unfinished work stopped, show at most five lessons with their reach, and save only the ones the user says yes to. Follow [references/memory.md](references/memory.md) for every step.

## Report mode (decision 0043)

**Reports are derived, never evidence** (decisions 0043, 0054, 0057): a report's text, accepted refresh included, is never a source for a new note, fact or proposal; if a report says something the notes don't, the report is wrong or the notes are missing something, and you say which. A report is not a proposal target either: knowledge only the brain has that a refresh left out is named to the user, not proposed. A refresh waits while the report's Notion page holds a proposed refresh, an unaccepted edit or accepted text not yet imported (the plan marks its `refresh_requests` item `wording_blocked`): say "resolve the text in Notion first" and leave its Refresh asked box ticked.

A report gathers everything the brain knows about one subject, as of today: "report on the Acme launch", "where do we stand with Acme?", or an **Ask** row in the Inbox (the catch-up hands you its page id, its question and its Project or Area). It runs only in the brain repo. In Notion a report is a page of **Documents** with Origin Report, its **Report row**, linked to the Ask rows on the Inbox through Asked in (decision 0071; an Inbox row of Kind Report before 0.9.1). Ask rows and Report rows are the **Reports** module (decision 0048, off by default; it needs Documents on): with it off, a report asked in chat is still written and answered in chat, but it gets no Report row, and render leaves it out (`MODULE_OFF`); say "turn on reports" to have it in Notion.

The report's text, inside its fixed sections and line shapes, follows [references/writing.md](references/writing.md) (decision 0081 §7). That page serves every skill that writes text people read; they link to it here.

0. **New or refresh?** A report is kept up to date in place, one per subject (decision 0045). Refresh an existing report when the request names it: its Report row has **Refresh asked** ticked by hand (the Refresh report button no longer ticks it, 0054) (the catch-up hands you `refresh_requests`), or the user says "refresh the Acme report". Otherwise write a new one: an Ask row is always a new report (decision 0048). Never guess that two questions are the same subject.
1. **Gather.** `brain query --candidates "<the subject>" --limit 50`, then again with the project's and client's names and the people's names. Read the project or area note and every decision, question, meeting and source that is about the subject, with `brain query --read` (up to 20 ids a call). A Brief, a Decision log or an earlier report is navigation, never content: use it only to find note ids, and write the report from the notes. `--read` withholds a view (`restricted`) while a note it was built from holds something the user excluded, and a report written before an exclusion until it is refreshed. A withheld view gives you nothing, not even its note ids: find the notes with `brain query --candidates` instead, and never open its file. On a refresh, leave `title`, `projects` and `area` out unless the user asked to change them: leaving them out keeps them. Unlike an answer, a report reads widely: everything that bears on the subject, `draft` notes included.
2. **Write the body:** exactly these six sections, in this order, with nothing before the first (spec/schema.md §16.4):
   1. `## Where it stands`: 3 to 5 lines, as of today.
   2. `## Timeline`: one bullet per dated event, oldest first: `- 2026-12-03 · Supabase chosen for auth ([Use Supabase for auth](../knowledge/decisions/2026-12-03-use-supabase-for-auth.md))`.
   3. `## Decisions in force`: current decisions only; a superseded one appears in the timeline, never here.
   4. `## Open questions and risks`.
   5. `## People involved`, each with their role.
   6. `## Gaps`: what the brain doesn't know ("no development update since August", "no budget figure").

   A section with nothing says `- None`. A note read in its awaiting-cleanup form is cited by its `cite` label as plain text, with no link: the read gave no path, and a report never shows a title or path the read didn't return. **Every line that rests on a `draft` note ends with ` *(not reviewed)*`:** a line whose linked note is still `draft`, even when a proposal about it was approved. A proposal still pending isn't in the brain yet: name it under Gaps ("waiting for your review: …"). Links are relative to `reports/` (`../knowledge/…`, `../projects/…`). Trust labels as in step 4 of the Procedure above; copy figures and dates as the notes state them.
3. **Store it:** `brain report new --input <file>` with `{ "title": "<subject>: where we stand", "question": "<the question as asked>", "projects": ["prj-…"], "area": "area-…", "asked_in": "<the Ask row's page id, only for an Ask row>", "body": "…" }`, with note ids for `projects` and `area`, both left out when the subject has neither (an Ask row with no Project or Area that names none). The CLI checks the sections and links and writes `reports/<date>-<slug>.md`. Commit in step 4: `report: <title>`.
   **A refresh** gathers and writes the whole body again, as of today, and passes `{ "refresh": "<the report's vw- id>", "body": "…" }`, plus `asked_in` when an Ask row asked for it; `title`, `projects` and `area` only when they changed. The CLI rewrites the same file (path, id, `question` and Notion row stay) with a new `generated_at`, and logs `report-refresh` itself; Git keeps the earlier version. Commit in step 4: `report: refresh <title>`.
4. **Log and commit:** `brain log report <vw-id> notes_read=<n> seconds=<s>` (the knowledge notes, meetings and sources whose full text you read, and the seconds the report took; decision 0045), then commit the report and the log together.
5. **Publish** *(Notion, per `settings.publish`)*: `brain sync render --changed`, write the Report row in Documents (its body is the report: the brain-ingest skill's references/notion.md, "Report bodies"; a refresh is an `update` that replaces the body and clears Refresh asked), then set the Ask row's Brain Status to Done through the MCP, then `brain sync record`, and commit `publish: report <title>`. In a catch-up, the run's one publish does this.
6. **Answer in chat** with the "Where it stands" lines and the Gaps, and the link to the Report row when published.

**What to fix on a report** (decision 0045). The user writes what the report gets wrong on its Report row ("Lucía left Acme in June"); the catch-up hands you `report_fixes`. The error lives in the notes, not in the report, so never edit the report's text to match:
1. Find the notes the line rests on. Read the report with `brain query --read <vw-id>` first. When it is returned, search with `brain query --candidates` on the user's What to fix text and on the report's `question`, and use the report to locate the line. When it is withheld, search on the user's text alone: never open the report's file, and never take the report's text or question from its Report row in Notion, which shows the report as last published. Read the notes you find with `brain query --read`. Write the correction as proposals (brain-ingest references/cli-inputs.md §3): an `update_fact`, an `add_to_note`, a `supersede` …, with `why` = the user's text, `source` = the notes' own source (the meeting or `src-` id the wrong claim came from) and `passages` = `["agent:brain-query/<the session's start, YYYYMMDDTHHMMSSZ>"]`: the correction rests on the user's words, not on the input (spec/eligibility.md §9.1). When the text needs no change to the notes (the report misread a note that is right), write none and say why in the report.
2. Record it: `brain report fix <vw-id> --text "<What to fix, as written>" --proposals <prp-id>,<prp-id>` (empty `--proposals ""` when none). The next publish clears What to fix on the row.
3. Once every proposal it listed is applied, rejected or closed, refresh the report (above); an approved or fixed one that was only recorded (`--record-only`) still waits. A catch-up checks this each run: a report whose last `fixes` entry lists only such proposals, and wasn't refreshed since, is refreshed.

**A report is never knowledge.** It is never ingested and never cited as a source, and it creates no proposal of its own: if the brain learned from its own summaries, its mistakes would become knowledge. Corrections go to the notes, as above.

## Example (synthetic Acme brain)

**Question:** *"What did we decide about auth with Acme, and why?"*

`brain query --candidates` returns the old Firebase decision first (score 16, `superseded`) and the Supabase decision second (15, `accepted`). The skill follows the supersession and answers with the current decision:

> Acme uses **Supabase for auth**, decided at the Acme sync on 2026-12-03 (knowledge/decisions/2026-12-03-use-supabase-for-auth.md). It replaced the earlier choice of Firebase, made at the kickoff on 2026-10-01 (knowledge/decisions/2026-10-01-use-firebase-for-auth.md, now superseded).
>
> **Why:** the minutes record the switch but not the reason. The brain's note suggests Firebase pricing changed and the team already used Supabase for the database, but that is marked as an inference, not something said in the meeting. The decision note is still a draft you haven't reviewed.

## Don'ts

- **Don't answer from `index.md`, the project views or a listing.** Views are for navigation; cite the canonical note they point to (AGENTS.md rule 8). To find a note, search with `brain query --candidates`, which ranks titles, summaries and aliases: there is no need to open `index.md`. `brain index --json` and the other administrative outputs may list memories nobody approved and text the brain withholds from answers: never evidence, never a fallback.
- **Don't read memory history for a present question.** `--include-superseded` and `--historical` are for "what was it before"; a question about now gets the current memories only.
- **Don't present a superseded or contested value as current.** The user acts on what you call current. Give the current value, and name the old one as history or both disputed values as contested.
- **Don't grep, list or open the brain's note files for an answer.** Search with `brain query --candidates` and `brain recall --search`, read with `brain query --read`. What those commands leave out, the user excluded, hasn't approved or meant for another project.
- **Don't read the whole brain.** It fills your context and buries the notes that answer. Search, then read a few notes with `brain query --read`; read more only when the ones you read point to them.
- **Don't edit anything,** including a "fix" you notice: answering is read-only (AGENTS.md rule 9), so a question never changes what the brain holds. Report it instead; the user can change it through a proposal or in Notion.
