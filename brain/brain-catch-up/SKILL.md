---
name: brain-catch-up
description: Do everything that is waiting in one run. Use when the user says "catch up", "what's next", "do what's waiting", "catch up unattended" (a schedule's prompt), "undo clean-up U2", or "schedule my brain". Pulls the user's Notion edits as corrections to ask; writes minutes for meetings with only a transcript; applies the ticks of a Ready Weekly row; ingests Ready meetings and Inbox rows, their attachments, the drop folder and linked repos; reads again the inputs the user corrected; keeps the documents and tasks asked for; takes in the changed versions, Documents and refreshes the user accepted; writes the reports asked for; proposes related knowledge; publishes and pushes. Asks the blockers once at the start, each input's parts by subject before writing it, then a round of the decisions waiting. Skips the steps of modules that are off.
---

# Catch up

One run for everything waiting (decision 0037). A **read-only pass** finds the work and every blocker, then **one batch of questions** settles the blockers, then the run takes the inputs in, asking each input's **parts by subject** before it writes it (decisions 0096 §2, 0098; brain-ingest references/parts.md), and ends with a round of the **decisions waiting** (0096 §5). Nothing is decided in Notion, except what the user ticked in a Ready Weekly row, which the run applies (decision 0110 §4). Anything that becomes blocked during the run is **skipped** and listed in the report; the rest goes on. Started as "catch up unattended", it asks nothing at all: follow "Unattended" at the end, which says what changes in each step.

This skill orders the work; the other skills hold the steps: brain-sync (pull and publish), brain-apply (the decisions asked in the session), brain-ingest with its references (meetings, sources, attachments, the drop folder, linked repos, Documents), brain-query (reports), brain-repos (a linked repo's task rollup), brain-workflow (a Factory's overview). Read each part when the run reaches it, and only when it has work ("What to read, and when" below). Their rules apply unchanged, whether or not this run read them, including the trust rules in the brain's AGENTS.md and brain-ingest's "What you may read, and what you may write": what the brain already holds is read only with `brain query --candidates` and `brain query --read` (spec/eligibility.md §10), never by opening, grepping or listing its files, in every step below, in every sub-agent and in an unattended run. A note the read withholds is skipped, never replaced by its file, a listing or its Notion page.

**The bar** (decision 0043): two meetings and one capture, from "go" to the report, in under 5 minutes without the session running out of context ([references/run-steps.md](references/run-steps.md), "The bar"). Note the time the run starts, and count the notes whose full text the run and its sub-agents read: the run logs both at the end (decision 0045).

**Modules** (decision 0048): `brain status` gives `modules`. A step marked with a module (*Orgs*, *Documents*, *Reports*, *Tasks*, *Planning*, *Factories*) runs only when that module is on; when it's off, skip the step and its questions without a word. Core (Inbox, Meetings, Projects, Areas, People) always runs. A module on but not set up: [references/read-only-pass.md](references/read-only-pass.md), "Modules".

**Example rows** (decisions 0084, 0087): nothing in the brain is ever made from a row whose title starts with `Example · ` (the Notion template's invented rows): [references/read-only-pass.md](references/read-only-pass.md), "Example rows".

**What to read, and when** (CC-264). Everything the run reads stays in the session and is paid for again on every later call, so read each part at its step, once, and skip it when its step has nothing this run. A sub-agent reads what its own work needs.

| Read | At | Only when |
|---|---|---|
| brain-sync "Pull" steps 1–6a, "Accepted wording" steps 1–3, references/formats.md | step 1.2 | Notion is configured |
| brain-ingest steps 2–3, references/selection.md §1–§3 | step 1.3 | a meeting is Ready (Reviewed, its name before 0.16.2, counts as Ready: decision 0109), or a Ready Inbox row has subjects and ids or a For the brain toggle |
| brain-ingest references/minutes.md | step 1.3b, Run step 1c | a New meeting has text on its page, or the drop folder holds a meeting file (its `meetings/` folder, a `.vtt` or `.srt` file) |
| brain-ingest references/sources.md, the sections for the kinds waiting | steps 1.4–1.7 | an Inbox row is Ready, a file is in the drop folder, or a linked repo has changes |
| brain-repos "The rollup (tracked-in-repo)" | step 1.7 | Factories is off and a found repo's kit has `tasks.mode` `tracked-in-repo` |
| brain-workflow references/overview.md | step 4.1.7 | *(Factories)* a Factory's overview changed (step 1.7) |
| brain-query "Report mode" | step 1.8, Run step 6 | the plan has reports work, or there is an Ask row |
| brain-ingest steps 4–8, references/extraction.md and cli-inputs.md, the writing reference | Run steps 2–3 | an input is ingested inline (a sub-agent reads them itself) |
| brain-ingest references/parts.md, steps 9–11 | Run step 3 | an input is written |
| brain-apply steps 2–4 | Run step 1, step 4.7 | a correction or finished task was written, or decisions wait |
| brain-sync "Push" and "Accepted wording" steps 6–9, brain-ingest references/notion.md "Publish" | step 4.1 | the run publishes; the publish sub-agent reads them itself, so the run reads them only when it publishes inline, and otherwise only "Accepted wording" step 7 for step 4.1.4b |
| [references/unattended.md](references/unattended.md) | before the first command | the run is unattended |
| [references/weekly-ticks.md](references/weekly-ticks.md) | step 1.13, step 2, Run step 1d, step 4.1.1c | a Weekly row is Ready, or the user says "undo clean-up …" |
| [references/schedule.md](references/schedule.md) | — | the user asks for a schedule, or `brain status`'s `schedule` needs a line (the batch's opening line) |
| [references/read-only-pass.md](references/read-only-pass.md), [references/run-steps.md](references/run-steps.md), [references/publish.md](references/publish.md): the section of each step with work | steps 1–2, 3, 4 | a step has work |

Keep text out of the session that nothing needs: never print an input's text (a transcript, a file) to look at it when the command that takes it returns what the run uses (`brain source extract` returns the extract's passages), and when you need a few fields of a long `--json` reply, filter it (`jq`, or a short `python3 -c`). After a context summary, read again only the section you need, not the whole skill.

**Working files.** Make your own temporary folder with `mktemp -d` and keep the saved Notion replies, `snapshot.json`, `plan.json` and the conversions in it; never a fixed name such as `/tmp/ub-catchup`: another session on the same machine would overwrite your plan.

Run every CLI command as `brain <command> --brain <brain> --json`. If `brain` is not found (`command not found`), install it with `npm install -g ultimate-brain`, then retry.

## 1. Read-only pass

This step changes no knowledge: no note, proposal, `brain.json`, commit, Notion page or drop-folder file. Two writes are allowed because they change nothing the user owns: `brain index` may regenerate a stale `index.md` (generated, rebuilt again later in the run), and the working files (`snapshot.json`, `plan.json`, conversions) go in a temporary folder outside the brain.

1. **Status.** Run `brain status` (and `brain index` if `index_stale`) and note what [references/read-only-pass.md](references/read-only-pass.md), "Step 1.1", lists; skip each Notion part whose database isn't configured. **Off its working branch** (`BRAIN_OFF_WORKING_BRANCH`): say its message in one line and offer "fix my backup" before the pass goes on. Never create a branch, a worktree or a pull request in the brain (decision 0086).
2. **Pull plan.** Brain-sync "Pull", steps 2–4, with the snapshot and plan in the temporary folder: read [references/read-only-pass.md](references/read-only-pass.md), "Step 1.2", for what to read and what `plan.json` holds. Run `sync plan` once.
3. **Meetings** *(Notion)*. Brain-ingest steps 2 and 3, up to the duplicate check: the Ready meetings, oldest first, and each one's pre-check blockers. For a selected summary, a meeting with minutes but no transcript, lean minutes and a re-read, read [references/read-only-pass.md](references/read-only-pass.md), "Step 1.3". Minutes files are ingested only when the user names them, never looked for.
3b. **Meetings without minutes** *(Notion)*. The New meetings with a transcript and no minutes in the format, and those whose text may be a transcript: brain-ingest references/minutes.md §1, as [references/read-only-pass.md](references/read-only-pass.md), "Step 1.3b", says. They aren't inputs: writing their minutes takes nothing in.
4. **Inbox.** The rows with Brain Status **Ready**, and only those (decision 0048): never a New or Done row, and you never set a row to Ready. Read [references/read-only-pass.md](references/read-only-pass.md), "Step 1.4", for checked rows, selected captures, re-reads, Only keep and Document asked, and repeats.
   **Ask rows** *(Reports)* are requests for a report, never ingested; **attachments** on the rows taken in and the Ready meetings are listed, all selected: [references/read-only-pass.md](references/read-only-pass.md), "Step 1.4".
5. **Drop folder.** The queue and its question (sources.md, "The drop folder", steps 1–2: whether to keep each file as a document, and whether one is a new version), without moving anything. A meeting file (in `meetings/`, a `.vtt` or `.srt` file, or one the user marks "meeting") becomes a Meetings row in Run step 1c, and its minutes join step 3b's question (brain-ingest references/minutes.md §5).
6. **Documents asked for** *(Documents)*: the `document_requests` items, the Ready rows with Document asked and the drop-folder files the user may keep, and *(Tasks)* the `task_documents` items, as [references/read-only-pass.md](references/read-only-pass.md), "Step 1.6", says. None of these asks a question.
7. **Linked repos.** For each entry of `repos` in `brain status`: `brain repo changes <name>`, as [references/read-only-pass.md](references/read-only-pass.md), "Step 1.7", says.
   **Their task rollups** (Factories off): for each found repo whose `kit` has `tasks.mode` `tracked-in-repo`, build its rollup now; *(Factories)* instead, `brain factory read` for each Factory that isn't archived: [references/read-only-pass.md](references/read-only-pass.md), "Step 1.7". Neither writes or asks anything.
8. **Reports** *(Reports)*. From `plan.json`, the reports due a refresh and each report fix with the proposals it would become: [references/read-only-pass.md](references/read-only-pass.md), "Step 1.8".
9. **Accepted wording** *(Documents, Reports)*. From `plan.json`, the accepted, waiting and no-baseline rows, as [references/read-only-pass.md](references/read-only-pass.md), "Step 1.9", says. A `refresh_requests` item marked `wording_blocked` does not run.
10. **The backlog.** `brain proposal backlog --dry-run` ([references/read-only-pass.md](references/read-only-pass.md), "Step 1.10"). It needs no question now.
11. **The decisions waiting.** `brain proposal list --waiting`: count them for the batch's opening line ([references/read-only-pass.md](references/read-only-pass.md), "Step 1.11"); they are asked after the run (step 4.7), not in the batch.
12. **Your identities.** If `brain.json` has no `owner.person`, add the identities question (brain-connect-notion, step 6).
13. **Your ticks** *(Notion)*. Each Inbox row of Kind **Weekly** with Brain Status **Ready**: its to-dos and Your note lines, as [references/weekly-ticks.md](references/weekly-ticks.md), "Step 1.13", says. It is a request, not an input: never ingested, not in the budget. A Weekly row still New is not read.

The pass is done when every input that is waiting has been found and each of its blockers is written down as a question or a default.

## 2. One batch of questions

Open with the lines of [references/read-only-pass.md](references/read-only-pass.md), "The batch's opening line", when `brain status` has them. Then ask once, in one message, numbered and grouped by input, each with the answer you will use if the user says "go" (the **default**):
- sync conflicts (`BOTH_CHANGED`, `MISSING_REQUIRED`, `UNRESOLVED_RELATION`, …), as brain-sync step 5 shows them (your corrections and finished tasks are not here: they are decisions, asked in Run step 1);
- each meeting's and input's pre-check blockers;
- each accepted text to import and each row with no baseline (*Documents*, *Reports*), and *(Reports)* each Ask row, Report row to refresh and report What to fix, worded as [references/read-only-pass.md](references/read-only-pass.md), "The batch's questions on accepted text and reports", says;
- the drop-folder list, all files selected, each with "keep as document? no / all / only …" (default **no**) when Documents is on;
- each attachment, all selected, and each linked repo's files when there are more than 10;
- each likely new version (default yes);
- each New meeting whose text may be a transcript ("is the text on the page a transcript or a summary?"), then the meetings with a transcript and no minutes, the new rows from meeting files included: "Write them? (yes / only … / no)", default yes (brain-ingest references/minutes.md §2). A yes is the user's yes to that Notion write, whatever `settings.publish` says;
- each item of a Ready Weekly row with text on its Your note line, with your reading of the note as the default ([references/weekly-ticks.md](references/weekly-ticks.md), "Step 2"); the plain ticks are already answered and only named;
- the identities question (default: skip for now, ask again next catch-up). The user's answer is their approval of those aliases;
- with `settings.publish: ask` and Notion configured: "Publish to Notion at the end?" (default yes). This is the run's only publish question. Without Notion there is nothing to publish: leave it out.

When nothing blocks, don't ask: say what you will do in one line and start. The batch never holds a part or a decision: those are asked in the run, where their context is. When nothing is waiting at all, give the report with `Done: nothing waiting` and stop.

## 3. Run, in this order

Every note, Document, report and question this run writes follows [the writing reference](../brain-query/references/writing.md) (decision 0081 §7); give its path to each sub-agent that analyses an input.

0. **The backlog, once** (decision 0041): `brain proposal backlog` ([references/run-steps.md](references/run-steps.md), "Run step 0").
1. **Pull and apply:** [references/run-steps.md](references/run-steps.md), "Run step 1": settle accepted wording, run **one** `brain sync apply --input plan.json` (never apply the plan twice), and ask the corrections and finished tasks before any input. Conflicts the user didn't answer stay conflicts.
1b. **After the apply, for each accepted Document or report imported** *(Documents, Reports)*: [references/run-steps.md](references/run-steps.md), "Run step 1b".
1c. **Meetings without minutes** *(Notion)*, after the apply and before any input: make each meeting file a Meetings row (brain-ingest references/minutes.md §5), then write the minutes of each meeting the user said yes to, one at a time (minutes.md §3: the check, the append, the `minutes-written` log line and its commit). They stay New: this run doesn't ingest them.
1d. **Your ticks** in each Ready Weekly row: `brain cleanup ticks --attended`, the noted items applied as the batch answered, then `ticks` again, as [references/weekly-ticks.md](references/weekly-ticks.md), "Run step 1d", says.
2. **Selected inputs are analysed inline**, one input at a time, like a re-read: [references/run-steps.md](references/run-steps.md), "Run step 2: selected inputs, inline". The rest of this step is for the other inputs.
   **Analyse each other input in its own sub-agent** (decision 0043), up to 4 at a time, or inline for a short run: read [references/run-steps.md](references/run-steps.md), "Run step 2: the analysing sub-agents", before you start one, for what to give it and what it returns. An analysing sub-agent never runs a write, a commit or a Notion call, and reads the brain only with `brain query`. A **re-read** is analysed inline in step 3 instead.
3. **Ask each input's parts, then write it,** one input at a time, in the order of step 1, as [references/run-steps.md](references/run-steps.md), "Run step 3", says: check its new notes against what the inputs before it wrote, then brain-ingest steps 9–11. "Stop" on an input leaves it as it is and goes on with the next; "enough" leaves the rest of that input waiting.
4. **Linked repos:** their files are inputs of steps 2–3 too; after a repo's last file, `brain repo record`, unless a file failed or the user wants some later (sources.md, "Linked repos", step 4).
5. **Documents** *(Documents)*, for the inputs already in the brain (step 1.6): [references/run-steps.md](references/run-steps.md), "Run step 5". Nothing is taken in until the user checks a checked row.
6. **Reports** *(Reports)*, with brain-query "Report mode": each What to fix, each refresh due and each Ask row the user didn't decline, as [references/run-steps.md](references/run-steps.md), "Run step 6", says. **Skip every report whose text waits in Notion** (`wording_waiting`, `wording_held`, `accepted_wording`, `wording_blocked`).

For each input, publishing waits for step 4 below. **Skipped, not asked:** an input whose ingest fails, or that the user stopped in its parts, is left as it is (the meeting or the row stays Ready, the file in the queue) and goes on the report's Needs you line. The one hard stop: a lint error in a file this run wrote. Stop the run there, commit nothing more, and report.

## 4. Publish, push, report

1. **Publish** (when `settings.publish` is `auto`, or the user said yes), once for the whole run, following brain-ingest references/notion.md "Publish" for each write, in this order. Run `brain views` first, so the project and area Briefs are current:
   0a. *(Selected inputs)* **Exclusion cleanup, before the pages:** [references/publish.md](references/publish.md), "Step 4.1.0a".
   **Pages and Tasks in one sub-agent** (CC-267). Steps 4.1.1 and 4.1.2 run in one sub-agent started with a fresh context window, never a fork of this session. Read [references/publish.md](references/publish.md), "The publish sub-agent's brief", before you start it: what to give it, what it reads, and its few-line answer. This is the one sub-agent that writes; the run does the other publish steps itself. When the session can't start sub-agents, the run does steps 4.1.1 and 4.1.2 inline, as written.
   1. **Pages:** `sync render --changed --plan plan.json` (**every render of the run carries `--plan plan.json`, the re-renders included**), write every item, `sync record`, as [references/publish.md](references/publish.md), "Step 4.1.1", says. No proposal is published. **Every write carries its final content.**
   1b. **Repo task rollups** (Factories off): write each rollup of step 1.7 on its target page: [references/publish.md](references/publish.md), "Step 4.1.1b".
   1c. **Weekly rows:** each Weekly row read this run, published with its row state so your ticks and notes stay: [references/weekly-ticks.md](references/weekly-ticks.md), "Step 4.1.1c". The run does it itself, after the sub-agent.
   2. *(Tasks)* **Tasks,** now that their projects and Inbox rows exist: the `sync tasks` calls of [references/publish.md](references/publish.md), "Step 4.1.2"; create each returned item once and `sync record` its page ids. The ingest is the only one that creates a meeting's Tasks (decision 0101 §5).
   2b. *(Tasks)* **Areas of tasks:** write each `task_areas` item of the plan, only while its Area is empty: [references/publish.md](references/publish.md), "Step 4.1.2b".
   3. **Skipped rows:** set Brain Status = **Done** on each Inbox row the user said to skip, and change nothing else on it: [references/publish.md](references/publish.md), "Step 4.1.3".
   4. *(Documents)* **Clear the boxes** of the Document asked requests this run carried out or found done: [references/publish.md](references/publish.md), "Step 4.1.4".
   4b. *(Documents, Reports)* **Accepted:** untick Accepted and clear Accepted at as brain-sync "Accepted wording" step 7 says (only for pages whose acceptance this run consumed).
   5. Log `brain log publish - pages=<n>` and commit `publish: catch up`.
   6. A meeting read again keeps Brain Status Ready until you set it back to **Done** through the MCP (brain-ingest step 12): do it for each re-read meeting.
   7. *(Factories)* **Overviews,** after the commit of step 4.1.5: for each Factory that changed, the Plan sentences, its Overview toggle and Overview as of, then `--written`: [references/publish.md](references/publish.md), "Step 4.1.7".
2. **Move the drop-folder files** (sources.md, "The drop folder", step 4): after the publish commit, or right after each file's ingest commit when the run doesn't publish.
3. **Log the run:** `brain log catch-up - notes_read=<n> seconds=<s>`, the notes the run and its sub-agents read with `brain query --read` and the seconds from "catch up" to here (decision 0045). Commit it: `log: catch up`.
4. **Push** per `settings.push` (AGENTS.md, "Write path"), never off the working branch; the report then ends with the backup line ([references/publish.md](references/publish.md), "Step 4.4").
5. **Report** once, in the shape of brain-ingest step 13, for the whole run: [references/publish.md](references/publish.md), "Step 4.5".
6. **The first meeting after setup** (decision 0078 §5), said once: when this run ingested a Ready meeting, read [references/publish.md](references/publish.md), "Step 4.6", for when to add its line and how to count it.

7. **The decisions waiting** (decision 0096 §5). When `brain proposal list --waiting` has any, ask the first round right after the report, as [references/publish.md](references/publish.md), "Step 4.7", says. When there are none, say nothing.

## Unattended: "catch up unattended"

The prompt a schedule runs, or the user by hand. Nobody is there to ask, and the run interprets no text of the user's (decision 0051). **Before its first command, read [references/unattended.md](references/unattended.md)** and follow it: it says what changes in each step. An attended run never reads it.

**Off the working branch: stop at once** (decision 0086 §2, spec/cli.md §6.1). The run's first command is `brain status`. When its `branch` has `on_working` `false` or `working` `null`, the run stops there and writes nothing anywhere; its last line of output is exactly the one the reference gives (`Not run: off-working-branch. …`).

## Undo a clean-up

When the user says "undo clean-up U2" (or names an item the weekly review cleaned up alone), follow [references/weekly-ticks.md](references/weekly-ticks.md), "Undo a clean-up, in a session". It is not a catch-up run: it undoes that one item and stops.

## Run on a schedule

When the user says "schedule my brain", "run catch-up every morning" (or "twice a day", "on weekdays"), "what is scheduled?" or "stop the scheduled catch-up", read [references/schedule.md](references/schedule.md) and follow it: the one procedure for the daily catch-up and the weekly review, on macOS and Windows, with Claude Code or Codex.
