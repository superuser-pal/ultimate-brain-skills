# The 0.16.0 migration's one read of Review and Questions (decisions 0096, 0099)

Read this only while the 0.16.0 Notion migration runs, in an attended session (its steps are in the migration file; spec/capture-and-review.md §7.9, spec/cli.md §5.14.8 and §5.14.9). From 0.16.0 nothing is decided in Notion: a plain `sync plan` ignores Review, Decisions and Questions rows. The migration reads them **once**, before it archives the databases, so a call the user already made on a Review row, and a Status they set on a Questions row, aren't lost. An unattended run never does this. After the migration, both options refuse (`REVIEW_RETIRED`, `QUESTIONS_RETIRED`), and this file has nothing left to do.

You apply **exactly what the user already decided** on a row. You never decide for them, never improve their wording, and never read a row they didn't submit as a decision.

## 1. Review rows

1. **Read.** Every Review row in State Pending that has a Brain ID, except an Example row: build its snapshot row (`database: "review"`) with Brain ID, State and the user's call: **Your call** and **What to fix** (before migration 0009: Decision and Note), each its label or text, or `null`. Add the object `review`: `{ "decided": <Decided ticked>, "decided_at": <Decided at, or null>, "accept_all": <Accept all ticked>, "page_edited_at": <the page's last_edited_time>, "body_markdown": "<the page body as Markdown>" }`, the body converted by the rules of brain-sync "Accepted wording" step 3, a block you can't convert written as the line `<!-- unconvertible block -->`, `null` when the body can't be read. Send the body as Notion returns it, escapes included: the CLI undoes them. Never read the item sections yourself; the CLI parses them, and finds a format-2 item by its gray `ref it-…` line.
2. **Plan:** `brain sync plan --review-transition --input snapshot.json`, saved as `plan.json` (its `data` object). It reads each row by 0.15.x's rules and gives `decisions` (a whole row's call), `review_decisions` (per item: the decision and the exact wording), `review_held` (what wasn't read, with a reason), `review_row_revisions` and `review_revisions` (a requested revision, with the user's instruction), and `conflicts`.
3. **Show** what will be applied, as a statement, not a question, for each row the user decided (Approve or Reject on a format-2 page, a format-1 page submitted with Decided ticked, Approve or Reject with an empty What to fix):
   ```
   Applying your Approve on From Depot survey:
   a · Pilot depots on Depot pilot: 11 → 9 (your Accept)
   c · New decision: Start the pilot with nine depots, Reviewed
   Left for the session: b · Start date (the brain is unsure)
   ```
   - **A call with text to read** (`NOTE_TO_READ`, `FIX_TO_READ`): read What to fix as what the user decided, show it in one line ("You approved it, and said: 'the pilot starts with nine'"), and apply after their yes.
   - **A requested revision** (an item's `Revision request:` line; Request revision or Fix with What to fix): never redraft it, and add no `review_revisions` to the plan. Its proposal stays pending, and is asked in this session with the user's instruction shown (step 5).
   - **A row that can't be read as a call** (`FIX_WITHOUT_TEXT`, `REVISION_WITHOUT_TEXT`, an unreadable token) and **a held item** (`review_held`: an edit after Decided, a missing section, a ⚠ change or ⚑ flag left on Pending under Approve, a value the passage doesn't hold): nothing is applied; the proposal stays pending and is asked in step 5.
   - **A pending row** needs nothing: its proposal is in `_proposals/`.
4. **Verify, then apply.** Commit anything of your own first (`sync apply` of decisions commits itself and refuses a dirty tree, `DIRTY_TREE`). Just before applying, re-read each page you will apply, rebuild its row, and run the plan again: for each item whose `snapshot_hash` and `proposed_hash` match the fresh plan's, set `verified` to `{ "snapshot_hash": …, "proposed_hash": … }` in the plan you apply; drop the others (the page changed since: ask them in step 5). Then `brain sync apply --input plan.json` once. Read each result (`applied`, `closed`, `skipped` with a reason, `failed`); on `RECOVERY_NEEDED` run `brain recover`. Carry out any `notion_writes` as brain-apply's "Notion writes" says. Write nothing back to a Review row: the migration archives the database next.
5. **Ask what is left**, in this session, as brain-apply step 2 says ("what needs my decision"): the requested revisions with the user's instruction shown as the question's first line (`You asked: "say the pilot, not the trial"`), the held items, and the rows that couldn't be read. A revision is drafted only now, in the turn, when the user's answer asks for it (brain-apply step 3, "A redraft").
6. `brain index`, `brain views`, `brain lint`, then commit `migrate: <n> Review calls applied`.

## 2. Questions Status

After §1, and before the migration archives the Decisions and Questions databases:
1. **Read** every Questions row that has a Brain ID, with **Status** and **Brain ID** only (`database: "questions"`), and run `brain sync plan --questions-transition --input snapshot.json`. The plan holds `question_status` items (a Status Answered or Dropped the user set), `conflicts` and `ignored`; nothing else is compared.
2. **Apply** with `brain sync apply --input plan.json`: an Answered question records `Marked Answered in Notion on <date>; the answer was not recorded.`, a Dropped one is dropped. Then `brain index`, `brain views`, `brain lint`, and commit `migrate: <n> question statuses from Notion`.
3. The migration then archives the two databases and offers the to-do tidy (brain-ingest references/todo-tidy.md), so each open question the user follows up becomes a task.
