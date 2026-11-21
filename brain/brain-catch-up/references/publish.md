# Publish, push and report (SKILL.md step 4)

Detail for the catch-up's step 4: the publish sub-agent's brief (CC-267), the pages and Tasks it writes, the push's backup line, the report and the first meeting's line. Read each section when the run reaches its step.

## Step 4.1.0a: exclusion cleanup, before the pages

0a. *(Selected inputs)* **Exclusion cleanup, before the pages:** after a new extract version that suppressed or re-included paragraphs, `brain source cleanup-propose --page <id>` (once per input; `PENDING_EXISTS` means it is already waiting; `NOTHING_TO_CLEAN` needs nothing) and commit it (`cleanup: exclusion cleanup waiting`): it is a decision, asked with the others (step 4.7). Unattended this is an addition; nothing is removed.

## The publish sub-agent's brief (CC-267)

**Pages and Tasks in one sub-agent** (CC-267). Steps 4.1.1 and 4.1.2 write the most and read the longest replies (each block append returns the page's blocks), so they run in one sub-agent started with a fresh context window, never a fork of this session. Give it: the brain path, the path of `plan.json`, the path of the first render (run `sync render --changed --plan plan.json` and save its output in the run's temp folder; read only its counts, never print it), the run's temp folder, and for step 4.1.2 each `sync tasks` call to make with its input file saved in that folder: exactly the Task items the ingest kept for this run, the owner's explicit to-dos only (brain-ingest step 6, references/selection.md §6), with the quick follow-ups' ids, never another person's action item, which stays text in its note, and anything this session was told about how to reach Notion. It reads only these parts itself, by their headings, never a whole file: brain-ingest references/notion.md "Publish" with "Inbox bodies" and "Report bodies", brain-sync "Push" steps 9 to 11, and "Accepted wording" steps 3, 6 and 9 (what goes in a record is in step 11; open references/formats.md only when `sync record` refuses one). It follows the trust rules above (the brain only through the CLI), does steps 4.1.1 and 4.1.2 as written below, the re-renders and `sync record` included, creates a Task only for an item `sync tasks` returns from the inputs it was given (it adds none and edits no input), and commits nothing. Its whole answer is a few lines, counts and ids only, never page ids, bodies or how it worked: pages written and recorded, by kind (notes, meetings, Inbox rows, reports, Briefs); Tasks created, with how many came from quick follow-ups; each write or record that failed, by its brain id with a few words of reason; and the lines for Check (an item left out with `pending_relations`, a `SECTION_NOT_FOUND`, a refused `sync tasks`, a new project to set up, Documents without Origin), or `none`. The run takes those into steps 4.1.4 (a failed item keeps its box), 4.1.5 (`pages=<n>`) and the report. This is the one sub-agent that writes; the run does the other publish steps itself, 4.1.0a before it starts it and the rest after it returns. When the session can't start sub-agents, the run does steps 4.1.1 and 4.1.2 inline, as written.

## Step 4.1.1: Pages

1. **Pages:** `sync render --changed --plan plan.json`, write every item (the one read-back allowed after a write: a Document or report body, brain-sync "Accepted wording" step 6, recorded as `@notion_body`) (pending relations: publish and record those first, then render again, until no item is pending), `sync record`. **Every render of the run carries `--plan plan.json`, the re-renders included**: without it nothing holds back a Document or report whose Notion text is waiting, and a properties-only write to an accepted page would move its last-edited time and make a fresh Accept look stale. With it, only the text waits on a page that is not accepted: its item has its properties and `body: null` (write them; no read-back), and an accepted page has no item. This publishes the notes and the Documents accepted in their parts (a `draft` Document gets no page until a session accepts it, decision 0071; an item with empty `properties` only waits for a note this render creates: write nothing for it), the meetings' relations, every source's Inbox row with its digest, the report rows (then each Ask row's Brain Status to Done), the cleared Refresh asked boxes, and the project and area Briefs, where the decisions and open questions show. No proposal is published. A Weekly row comes back in `skipped` with `ROW_STATE_REQUIRED`: that is expected, and the run publishes it itself with its row state (step 4.1.1c), so your ticks and notes stay. Write in parallel, up to 10 at a time, and never read a page back after writing it, **except** the one read-back of a Document or report body described above (brain-sync "Accepted wording" step 6). If that read-back fails, record the page with `"@notion_body": null` (a null removes the old baseline: the next run holds the page, row 9, until the user adopts a side; this includes a previously published report just refreshed). If the record itself fails, say so on the Needs you line. **Every write carries its final content:** never create a page or write a body with placeholder text to fill in later (brain-ingest references/notion.md, "One write, final content").

## Step 4.1.1b: Repo task rollups

1b. **Repo task rollups:** write each rollup of step 1.7 on its target page, as the brain-repos skill, "The rollup (tracked-in-repo)", step 2 says (the `Repo tasks · <name>` toggle, replaced or appended; never read back). A target with no `notion` page yet gets none: name it under Check. Count them on the Done line ("2 repo task lists updated").

## Step 4.1.2: Tasks

2. *(Tasks)* **Tasks,** now that their projects and Inbox rows exist: `sync tasks --meeting` for each ingested meeting of the old kind and `sync tasks --source` for each ingested source with owner tasks and for every selected input, meetings included (brain-ingest references/selection.md §6); and `sync tasks --question` for each question a `Track: Waiting On —` line tracks (brain-ingest references/track.md); create each returned item once; `sync record` its page ids. The ingest is the only one that creates a meeting's Tasks (decision 0101 §5). The quick follow-ups left unticked in lean minutes that the run ingested go in the same `--source` call, each with its `follow_up` id, and are recorded by that id (selection.md §6, "Follow-ups"); one `sync tasks` refuses because its id already has a Task is named under Check. An item still listing `pending_relations` (a project that isn't in Notion) is not created: list it under Check.

## Step 4.1.3: Skipped rows

3. **Skipped rows:** set Brain Status = **Done** on each Inbox row the user said to skip, and its Summary to why ("Skipped: same as Acme requirements"), through the MCP; change nothing else on it (decision 0048).

## Step 4.1.4: Clear the boxes

4. *(Documents)* **Clear the boxes:** untick Document asked on each Inbox row of step 3.5 (and of the Ready rows that asked for one, and of each checked row taken in) and set its Brain Status to Done; on each task of step 3.5.3, untick Document asked and nothing else. Only for requests this run carried out or found done (decision 0048).

## Step 4.4: Push

4. **Push** per `settings.push` (AGENTS.md, "Write path"), never off the working branch. The report then ends with the backup line (brain-setup references/backup.md, "The report's last line"): none after a push that succeeded; `<n> changes not backed up yet (Back up after each run: remind me).` with `remind`; `Not backed up: <reason>. Say "fix my backup".` when the push failed or wasn't made.

## Step 4.5: Report

5. **Report** once, in the shape of brain-ingest step 13, for the whole run:
```
Done: 3 captures and 2 files ingested · 12 new notes · 2 corrections accepted · 2 documents kept · 1 task for you
Needs you: 4 decisions waiting · 2 files skipped (too long, say which parts)
Next: the first round of decisions, below
```
**Done** counts the minutes written ("2 minutes written"), and right after the three lines comes their one line, `Minutes written: Acme sync, Pilot kick-off. Check them, mark Meeting only what stays out, and set each Ready.` (brain-ingest references/minutes.md §3). **Needs you** names how many decisions still wait (`proposal list --waiting`), the meetings whose minutes couldn't be written (minutes.md §3 step 4), the Weekly row items that wait for a session (weekly-ticks.md, "The report"), the changed versions waiting for the user's check ("1 changed document to check: say *go*, or set it Ready"), and the conflicts, skipped inputs and failures. **Next** is the round of step 7 when decisions wait, else one action. Without Notion, "connect the brain to Notion" goes on the Needs you line.
*(Tasks)* The Tasks count holds every Task the run created; the quick follow-ups among them are counted in a bracket, a number and never their text: "3 tasks for you (2 from quick follow-ups)" (decision 0079 §4). Leave the bracket out when there are none.
Below the three lines: **What came in** (each re-read with what changed; each Document with what it keeps) and **What changed**, then the **reports written or refreshed**, each with its row, then **Check** (each skipped input with its reason, each attachment that couldn't be read, the notes kept as drafts, the parts left for later, stale proposals, assumptions), as brain-ingest step 13 defines them, uncapped. Offer the `settings.publish` switch here when AGENTS.md says to.

## Step 4.6: The first meeting after setup

6. **The first meeting after setup** (decision 0078 §5), said once. Read the setup lines with `grep -h ' setup - ' <brain>/log/*.md`. When this run ingested a Ready meeting, first value has passed (the latest line with `step=first-value` has `result=done`, `report`, `organised` and `answer` each `pass`, and `tasks` `pass` or `skip`), and no line has `step=first-meeting`, add one line right after the three, before the sections below them:
   ```
   First meeting in: 3 tasks for you (1 from a quick follow-up), 4 notes, 2 people matched, 0 new people. Anything wrong? Say "that's wrong: …".
   ```
   Count from that run's oldest Ready meeting only: the owner's Tasks its ingest created, of which the quick follow-ups that became Tasks (leave the bracket out when there are none), the notes it wrote (the new person notes included), its attendees matched to existing person notes, and the new person notes (`1 new person`, `2 new people`). Then `brain log setup - step=first-meeting result=done`, commit `setup: first-meeting`, and push per `settings.push`; a push that failed or wasn't made is said as step 4's would be. Say nothing and log nothing while first value is unresolved (its latest line is `result=failed`, or a check isn't `pass`), after a `first-meeting` line, or in a brain with no `setup` line. Unattended runs follow the same rule; the line goes in their report.

## Step 4.7: The decisions waiting

7. **The decisions waiting** (decision 0096 §5). When `brain proposal list --waiting` has any, ask the first round right after the report, as brain-apply steps 2 to 4 say: at most five questions, the corrections from Notion first as one question, a source's waiting notes as one question per source with its parts' short views, "more" for the next round, "enough" to stop. Its answers are applied, committed and published there. When there are none, say nothing.
