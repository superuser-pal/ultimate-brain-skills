# Unattended: "catch up unattended"

Read by brain-catch-up for an unattended run, before its first command; an attended run never reads it. Step numbers are those of brain-catch-up's SKILL.md ("Run step 3" is its section "3. Run, in this order"), and every rule there applies except what this file changes.

The prompt a schedule runs ([schedule.md](schedule.md)), or the user by hand. Nobody is there to ask, so every question of step 2 takes its default or skips its input, and the run goes on (decision 0051). It carries out what the user already decided word for word and interprets no text of theirs, because turning their words into changes is judgment nobody would check. It may quote a What to fix as written (in a report, to say what waits); it never works out what it means or acts on it. The 5-minute bar is for attended runs; a budget of inputs replaces it.

**Off the working branch: stop at once** (decision 0086 §2, spec/cli.md §6.1). The run's first command is `brain status`. When its `branch` has `on_working` `false` (another branch checked out, or a detached `HEAD`) or `working` `null`, the run stops there: no read, no Notion call, no commit, no push and no log line, nothing written in the brain or in Notion. Its last line of output, which the scheduler's log keeps, is exactly:

```text
Not run: off-working-branch. The brain is not on its working branch; say "fix my backup" in a session in the brain.
```

The next attended session sees the warning in `brain status` and offers the fix. Never switch branches, merge or push to fix it yourself: that needs the user. A branch with commits the working branch lacks while the brain is on its working branch (`unmerged` alone) doesn't stop the run: its writes land on the working branch, and the warning waits for the attended session.

Then do the read-only pass (step 1), but never interpret a What to fix: skip step 3, and in step 9 only note that a `report_fixes` item exists, without working out the proposals its text would become (its report and its refresh then wait, below). Then:

1. **Nothing waiting and nothing failed: stop.** No commit, no Notion write, no log line, no report. A schedule that runs twice a day must leave no noise.
2. **Take each question's answer from this table** instead of asking:

   | The batch would ask about | Unattended |
   |---|---|
   | A sync conflict | **Skip the whole row**: nothing from it is applied or published (`--skip-conflicted`); named under Needs you |
   | What to fix on a Review row, or on a report (`NOTE_TO_READ`, `FIX_TO_READ`, `FIX_WITHOUT_TEXT`, `report_fixes`) | **Skip** it: it waits for an attended run, and a report with a fix waiting isn't refreshed meanwhile |
   | A meeting or Inbox row with a pre-check blocker, a likely new version, or a long attachment ("which parts matter?") | **Skip** it whole: the meeting stays Reviewed, the row Ready, a file stays in the queue |
   | An input that is not Reviewed/Ready (unconfirmed), or confirmed less than 2 minutes ago (`TOO_FRESH`) | **Skip**; it is never set to Reviewed/Ready by the run. Named under Needs you |
   | A selected input with a blocker (`SELECTION_UNMAPPABLE`, `SELECTION_UNREADABLE`, `UNNUMBERED_LINE`, or minutes with no transcript, named with selection.md's fix), or a re-read that changes the transcript | **Skip** it whole and name it with the line; nothing is ever ingested as the whole transcript |
   | A confirmed, settled selected input; a re-read with the same transcript | **Default**: the extract is written without a preview (the report states that an edit in the confirming minute cannot be detected) |
   | An item "possible Task" (`legacy_tasks`), an ambiguous owner, a Waiting On offer | **Skip**: no Task; named under Needs you |
   | *(Tasks)* A quick follow-up left unticked in lean minutes the run ingests (`task: true`) | **Default**: created with the input's ingest, once per `q` id, as attended but with no question; counted on the Done line. The held-back ones go under Check. |
   | An item on a Review row with item sections | **Default** only when its decision is explicit, exact, current, the base unchanged and `unattended_ok`; held items, `Request revision`, `base_changed` and an Accept all with an ineligible item **wait**, and revision text is never read (`review_revisions` is removed from the plan before `sync apply`) |
   | A capture that repeats a source the brain has | **Default**: skipped, with "Skipped: same as <title>" on its row when the run publishes |
   | The drop folder: not set, or a long file | **Skip** the folder, or the long file. An unset folder is a line on the report ("Drop folder not set: say where it is"), never work and never a reason for a Catch-up row: a brain that doesn't use one would otherwise report it on every run |
   | The drop folder's other files, attachments, and a linked repo's files | **Default**: all of them, none kept as a document; a repo with more than 10 files is taken within the budget, and `repo record` waits until every listed file is in |
   | A tracked-in-repo repo's task rollup | **Default**: rebuilt, and written with the publish; a failed fetch keeps the old one and goes under Check |
   | Pending proposals in chat, and the identities question | **Skip**: left pending; asked at the next attended catch-up |
   | *(Reports)* An Ask row | **Default**: a new report |
   | *(Reports)* A Report row to refresh (Refresh asked, or a report whose fixes are all decided) | **Default**: refreshed, unless it has a What to fix waiting |
   | *(Documents, Reports)* An `accepted_wording` item | **Default**: imported when `unattended_ok` (accepted at least 2 minutes before the run) and the re-read of its page (brain-sync "Accepted wording", step 5) finds it unchanged; otherwise it **waits** (`TOO_FRESH`, or `CHANGED_SINCE_PLAN`). The preview needs no yes: the user's acceptance is the decision. The report says an edit in the click's own minute cannot be detected (decision 0058) |
   | *(Documents, Reports)* A `wording_waiting` row, a `NO_BASELINE` row, a refresh marked `wording_blocked` | **Skip** and name it (waiting rows under Needs you); nothing is imported, adopted or refreshed |
   | *(Documents)* The Related knowledge proposal for an imported Document | **Default**: written (a proposal is an addition) |
   | "Publish to Notion at the end?" | **Default** from `settings.publish`: `auto` publishes, `ask` publishes nothing |

3. **Settle accepted wording, drop what belongs to a conflicted page, then apply only what was decided word for word.** First, for each `accepted_wording` item: import it only if `unattended_ok` is true **and** the re-read of its page (brain-sync "Accepted wording" step 5) finds it unchanged, adding `verified`; **any other item moves into `wording_held`** (`reason: "UNACCEPTED_DRAFT"`, `"accepted": true`), so it is neither imported nor published over, and goes on the Needs you line as waiting (`TOO_FRESH` or `CHANGED_SINCE_PLAN`). A `NO_BASELINE` row is left as it is (it needs an attended run). Then remove from `plan.json` every `document_requests`, `promote_requests`, `refresh_requests` and `report_fixes` item whose `page_id` is the `page_id` of a conflict: that row is skipped whole, so it makes no Document, promotion or refresh, and its box stays ticked for the next attended run. Then `sync apply --input plan.json --skip-conflicted`, without `--record-only`:

   | In the plan | Unattended |
   |---|---|
   | A Review row set to Approve or Reject with What to fix empty | **Applied** |
   | An approved Suggestion row that changes a Notion-owned field (Kind Notion Change) | **Applied**: its Notion write is carried out and settled (brain-sync step 6b) |
   | A property the user changed in Notion (Key Facts, Role, Name, Summary, Why, Deadline, Area, Goal, Client, Org, People), Lifecycle, Status, Priority, Dates and the other fields theirs | **Applied** |
   | A row the user created in Notion (area, goal, project, person, org) | **Applied**: an addition |
   | Approve or Reject with What to fix, a Fix, a Fix with no text, a What to fix on a report | **Waits**: counted, and named ("1 Fix waiting for you") |
   | An `ignored` item (`NOT_CORRECTABLE`, `NOT_A_REPORT`, `MODULE_OFF`, …) | Nothing is done, as in an attended run, and a change the user made that the brain can't take (`NOT_CORRECTABLE`) goes under **Check** with the same line brain-sync step 5 gives, so it doesn't disappear from the report |

4. **The budget.** Take at most `settings.unattended.max_inputs` inputs (default 10), oldest first: each Reviewed meeting by its date, each Ready Inbox row (its attachments go with it) by when it was created, each drop-folder file by when it was modified, each changed repo file by its commit date. Skipped inputs don't count; failed ones do. An input the brain already has (`DUPLICATE_SOURCE`, for instance one an earlier run wrote but couldn't publish) is not an input again. The rest is `left`: name them ("4 more wait for the next run") and leave them as they are. Requests (Documents, promotions, refreshes, Ask rows, the backlog) aren't inputs.
5. **Run the rest of the run, not the apply again.** The apply already happened in step 3 of this list (the plan is applied **once**; never apply it a second time). Resume at Run step 3.1b (Related knowledge for the Documents imported, using step 3's apply results), then Run steps 2 to 6 and step 4, with these changes: no chat decisions; the rows held in `wording_held`, the conflicted rows (`--skip-conflicted`) and the report fixes waiting stay held; a step that fails is logged and the run goes on with the next input; a lint error in a file this run wrote still stops the run. Publish only with `settings.publish: auto`, using `sync render --changed --plan plan.json --skip-conflicted`: a conflicted row and a report with a What to fix waiting come back in `skipped` and stay as they are. With `ask`, commit and push (per `settings.push`) and leave the publish to the next attended run. A push that fails ends the output with the backup line, as step 4 says (`Not backed up: <reason>. Say "fix my backup".`).
6. **Report** in the usual three lines, and say the unattended facts: what is `left`, `waiting`, skipped and failed. Then:
   - **Log it** (also when nothing was published): `brain log catch-up - mode=unattended inputs=<n> left=<n> skipped=<n> waiting=<n> failed=<n> report=<yes|no> notes_read=<n> seconds=<s>`, with `failures="<reason>; <reason>"` before `report` when a step failed (a few words each: "Notion login"). `inputs` counts the inputs taken in, failed ones included. Commit it: `log: catch up (unattended)`.
   - **One Inbox row of Kind Catch-up, only with Reports on, `settings.publish: auto`, and something that needs the user or failed.** It is the run's history, not a report, so it stays in the Inbox (decision 0071; Kind Report before 0.9.1). Create it through the Notion tools in the publish step: Name `Catch-up <D Mon>: <n> in, <n> need you` (`, <n> failed` when one did), Kind Catch-up, Brain Status Done, no Brain ID, the report as its body. A run that went well and needs nothing writes no row. A Notion failure can't be reported in Notion; the log line still holds it.
   - With Reports off, or `ask`, nothing else is written: what needs the user waits where they act on it, and the next attended catch-up opens with the summary of the scheduled runs.
