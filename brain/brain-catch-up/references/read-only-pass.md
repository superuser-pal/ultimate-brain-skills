# The read-only pass and the batch's opening line (SKILL.md steps 1 and 2)

Detail for the catch-up's steps 1 and 2. Read only the sections of the steps that have work this run. Each step in SKILL.md keeps its stops and the rules that choose its path; this page holds the rest, as the step says.

## Modules (decision 0048)

**Modules** (decision 0048): `brain status` gives `modules`. A step marked with a module (*Orgs*, *Documents*, *Reports*, *Tasks*, *Planning*) runs only when that module is on; when it's off, skip the step and its questions without a word. Core (Inbox, Meetings, Projects, Areas, People) always runs. A module that is on but whose database id is still empty (`brain modules` lists it under `missing`) is named once on the report's Needs you line: "Documents is on but its database isn't set up: say "set up documents"".

## Example rows

**Example rows** (decisions 0084, 0087): a row whose title starts with `Example · ` (the word `Example`, a space, the middle dot `·`, a space) is one of the Notion template's invented rows, which setup removes when it connects the brain. Nothing in the brain is ever made from one: the pull leaves it out (brain-sync step 2), and steps 4 and 5 skip such a meeting or Inbox row as brain-ingest does. The report names how many were left out, once, under Check: "2 example rows skipped: delete them in Notion, or say "set up my brain" to remove them". An unattended run does the same.

## Step 1.1: Status

1. **Status.** Run `brain status`; run `brain index` if `index_stale`. Note `settings` (absent means `publish: ask`, `push: auto`, `unattended.max_inputs: 10`), and `unattended` (the scheduled runs since the last attended catch-up), `modules`, and which databases are configured. Each Notion part below needs its database configured; skip the ones that aren't and name them once on the report's Needs you line. **Off its working branch:** when `brain status` has the warning `BRAIN_OFF_WORKING_BRANCH`, say its message in one line and offer "fix my backup" before the read-only pass goes on (an unattended run follows "Unattended" instead) (brain-setup references/backup.md, "Off the working branch, at the start of a run"). Never create a branch, a worktree or a pull request in the brain (decision 0086).


## Step 1.2: Pull plan

2. **Pull plan.** Brain-sync "Pull", steps 2–4, with the snapshot and plan in the temporary folder. Read **every** configured database of a module that is on (brain-sync step 2 lists them, Goals, Key Results and Documents included; never Meetings), all pages of each, plus the Inbox rows brain-sync step 2 names. Run `sync plan` once and save `plan.json`. With Tasks on, read the tracked tasks too (brain-sync step 2, `brain sync tracked`), and *(Documents)* the tasks with Document asked ticked when `notion.tasks.properties.document_asked` is mapped. It holds the imports, your corrections (they only wait), the finished tracked tasks (*Tasks*; they only wait), the conflicts, `document_requests` (*Documents*), `refresh_requests` and `report_fixes` (*Reports*), and the wording arrays `accepted_wording`, `wording_waiting`, `wording_held` and `clear_accepted` (*Documents*, *Reports*: brain-sync "Accepted wording" steps 1 to 3 say which pages to read and how; step 1 selects them from the Documents rows this step already read, when that read is complete, instead of a second query).

## Step 1.3: Meetings

3. **Meetings** *(Notion)*. Brain-ingest steps 2 and 3, up to the duplicate check: the Ready meetings, oldest first, and each one's pre-check blockers. For a summary with subjects and ids (escaped or not, selection.md) or a For the brain toggle, also brain-ingest references/selection.md §1–§3 in read-only form: its `extract-plan` blockers (`SELECTION_UNMAPPABLE`, `SELECTION_UNREADABLE`, `UNNUMBERED_LINE`), a meeting with minutes but no transcript (selection.md §2 step 1: not a question, the user fixes it in Notion; name it under Needs you with that step's fix, word for word, and leave the meeting Ready) and an input that is unconfirmed or too fresh (the page edited less than 2 minutes before the run, `TOO_FRESH`, a label of this skill) are batch questions, What will be copied is shown in the input's parts (Run step 3), not in the batch. In lean minutes (a For the brain toggle, decision 0079) the parts name the quick follow-ups that become Tasks, with their text (default: created; to keep one out the user ticks or deletes it on the page, and the run reads the page again before writing it, references/selection.md §4). A meeting the brain already ingested and that is Ready again is a **re-read** (decision 0045): the user fixed its minutes; say so in the batch ("Acme sync, read again: only what changed"). Minutes files are ingested only when the user names them, never looked for.

## Step 1.4: Inbox

4. **Inbox.** The rows with Brain Status **Ready**, and only those (decision 0048): never a New or Done row, whatever its Kind or age. **Checked rows** (Changed from set, no Brain ID; brain-ingest references/checked.md) are read too: a Ready one is an input, taken in as checked.md says (not a capture); a New one waits for the user's check and is only counted for Needs you ("1 changed document to check: say *go*, or set it Ready"). Find each one's original (checked.md, "Finding the rows"); none or two is `CHECKED_FROM_UNKNOWN`, a batch question ("which document is *Ops plan (changed)* a change of?"). A Ready row whose checked row still waits is skipped and named under Needs you. A Ready checked row edited less than 2 minutes before the run is `TOO_FRESH`. A capture or voice note with subjects and ids (escaped or not, selection.md) is read like a selected meeting (references/selection.md); a New row is unconfirmed and never taken, and you never set a row to Ready. Oldest first, each with its pre-check blockers (brain-ingest references/sources.md, "capture"). A Ready row with a Brain ID is a **re-read**, as for meetings. A row with Project or Area set needs no project question. A row's **Only keep** and **Document asked** come with it; an empty Only keep is never asked about (decision 0049). A Ready row with Document asked and Only keep filled is not ingested: its files' parts become checked rows (step 1.6). A capture that repeats a source the brain already has: default skip, naming that source and linking its row (sources.md, "Pre-check").

   **Ask rows** *(Reports)* (Kind = Ask, Brain Status New or Ready) are requests for a report, not captures: never ingest one; note its question (the Name) and its Project or Area for the report ("Run", step 6).
   **Attachments** on the rows taken in and the Ready meetings: list each file (sources.md, "Attachments"), all selected by default. On a row with Document asked ticked, each file becomes a Document (step 1.6).

## Step 1.6: Documents asked for

6. **Documents asked for** *(Documents)*. From `plan.json`, each `document_requests` item (a row already taken in whose Document asked box is ticked), plus the Ready rows of step 4 with Document asked ticked and the drop-folder files the user may keep. An item with `existing` is already done: the run only clears its box. An item, row or file with **Only keep** filled writes a **checked row** of its part for the user to check, and takes nothing in (brain-ingest references/checked.md). *(Tasks)* Each `task_documents` item is a task to keep as a document (brain-ingest references/task-document.md). None of these asks a question; name them in the batch's opening line ("I'll also keep 2 documents and 1 task, and write 1 changed version for you to check"). Promote to document is asked in the session (brain-ingest, "Promote to document"), never read from Notion.

## Step 1.7: Linked repos and their task rollups

7. **Linked repos.** For each entry of `repos` in `brain status`: `brain repo changes <name>` (sources.md, "Linked repos"). A repo with `found: false` is named on the Needs you line. More than 10 files: they go in the batch as a list, default all.
**Their task rollups.** For each found repo, `brain repo show <name>`: when its `kit` has `tasks.mode` `tracked-in-repo`, build its rollup now with the brain-repos skill, "The rollup (tracked-in-repo)", step 1 (`brain repo tasks <name>`, with the issues fetched for GitHub or GitLab), whether or not it has changed files, and keep `toggle` for the publish (step 4.1.1b). It writes nothing and asks nothing. A refusal or a failed fetch writes no rollup and keeps the old one: say why under Check.

## Step 1.8: Reports

8. **Reports** *(Reports)*. From `plan.json`: each `refresh_requests` item, and each `report_fixes` item with the proposals its text would become (brain-query, "What to fix on a report"), written down as what the run would propose. Also each report whose last `fixes` entry lists only proposals now applied, rejected or closed, and that wasn't refreshed since: it is due a refresh.

## Step 1.9: Accepted wording

9. **Accepted wording** *(Documents, Reports)*. From `plan.json`: each `accepted_wording` item (text the user accepted, to be imported exactly: brain-sync "Accepted wording", step 4 shows its diff), each `wording_waiting` row (named under Needs you with its reason in plain words) and each `NO_BASELINE` row, accepted (`wording_waiting`) or not (`wording_held`), as a question (brain-sync "Accepted wording" step 8: an accepted one may adopt Notion's text; an unaccepted one is told to click Accept first; adopting Git is a paste by the user). A `refresh_requests` item marked `wording_blocked` does not run: name it ("Acme report: resolve the text in Notion first"); its Refresh asked box stays ticked.

## Step 1.10: The backlog

10. **The backlog.** `brain proposal backlog --dry-run`: the waiting notes the run will list once for notes from before 0.4.0, one per source. They need no question now; they join the decisions waiting ("2 older sources' notes to look at, later").

## Step 1.11: The decisions waiting

11. **The decisions waiting.** `brain proposal list --waiting`: count `waiting` and `held`. They are asked after the run (step 4.7), not in the batch; name the count in the batch's opening line ("4 decisions wait: I'll ask them at the end").

## The batch's opening line (step 2)

When `unattended.catch_up` in `brain status` isn't null, open with the scheduled runs since the last attended one, as one line: "Since last time: 4 scheduled runs, 6 inputs in, 1 skipped, 3 decisions waiting, 1 failed: Notion login". Say "Backlog growing: run more often or raise the budget" too when `unattended.backlog` is true. When `unattended.weekly` in `brain status` isn't null, add the weekly review's line (brain-weekly-review, "The opening line"): `This week's review is ready: <a> actions and <c> clean-up items to tick, <u> cleaned (<report path>).` when its `report` is this week's (a part at 0 left out), and `Last weekly run failed: <reason>.` or `Last weekly run did not finish (started <D Mon HH:MM>).` when they apply. When `schedule` in `brain status` asks something of the user (a job with a slot not installed on this computer, an entry that doesn't match, or a schedule from before 0.17.0 not recorded), add one line: `Your schedule isn't installed on this computer: say "schedule my brain".` (`isn't in the brain yet` when `schedule.recorded` is false and `settings.schedule` is `on`). Nothing when the schedule is off or installed as recorded. Then ask once, in one message, numbered and grouped by input, each with the answer you will use if the user says "go" (the **default**):

## The batch's questions on accepted text and reports (step 2)

- each accepted text to import (*Documents*, *Reports*), as "Login page: import your accepted write-up? (+12 −3 lines; shown below)" with the diff of the whole file under it (default: yes), and each row with no baseline, as "Acme report: Notion's text and the brain's differ; keep which? (default: leave both)";
- *(Reports)* each Ask row, as "Report on <its question> (default: yes)"; each Report row to refresh, and each report What to fix with the proposals it becomes ("Acme launch report: 'Lucía left Acme in June' → Lucía's org: Acme → none, from June");
