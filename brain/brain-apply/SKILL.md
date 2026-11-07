---
name: brain-apply
description: Apply the user's decisions on proposed changes to the brain. Shows pending proposals in chat and applies what the user approves, rejects or fixes, or reads the calls and What to fix texts the user left in the Notion Review queue and applies them, then rebuilds and republishes. Use when the user says "apply my reviews", "what needs my decision", "approve the launch change", "apply the Review queue", or after deciding proposals in Notion.
---

# Apply review decisions

Proposals are changes the brain wants to make to existing notes (decision 0003). The user decides each one: **Approve**, **Reject**, or **Fix** (apply it, corrected as the user says in plain words; decision 0045). This skill records those decisions and applies them through the CLI. Only the user decides. Never approve, reject or fix on their behalf, and never infer a decision from the minutes or from earlier chat.

Run every CLI command as `brain <command> --brain <brain> --json`. Exit 1 means some items need attention; read them. Exit 2 or 4 means your command or input was wrong: fix it. Exit 3 or 5 means stop and report. Exit 10: report a bug. If `brain` is not found (`command not found`), install it with `npm install -g ultimate-brain`, then retry.

## Pick the mode

- **Chat:** the user wants to decide here ("what needs my decision?", "approve the budget change"). Use this, or when Notion is not configured.
- **Notion:** the user decided in the Notion Review queue ("apply my reviews"), and `brain status` shows `review` among `notion.configured`.
- **Unattended** (a scheduled catch-up, nobody in the chat): Notion mode, applying only what the user decided word for word: Approve or Reject with an empty What to fix, and, on a row with item sections, the explicit, exact, current decisions of references/review-items.md (never revision text). A decision with text in What to fix (a Fix, or "all except b") stays in its row for an attended run, because turning words into changes is judgment nobody would check (decisions 0003, 0051). `--record-only` is for a run that must not apply anything at all.

## Chat mode

1. **List.** Run `brain proposal list --status pending,approved,edited,rejected`. `approved`, `edited` and `rejected` ones were decided earlier but not yet applied.
2. **Show** the pending ones as a numbered list, one line each, in words the user can judge without opening files:
   `3. Acme website: budget 80000 EUR → 95000 EUR. "Budget raised to 95000 EUR to cover the CMS licence." (Acme launch review, 10 Dec)`
   For each kind:
   - `update_fact`: old → new value.
   - `contradiction`: both values, and say approving keeps both as contested, while a fix picks the true one.
   - `add_to_note`: the text to add.
   - `update_body` (decision 0045): the reference note and the lines that change, `-` old and `+` new.
   - `add_link`: what gets linked to what. A grouped row lists every link, lettered: "Acme website: add a) Lucía Fernández, b) Tomás Vidal to People, c) alias 'acme site'".
   - `supersede`: the new note replaces the old one.
   - `merge`: the duplicate is folded into the survivor.
   - `new_item`: the note that would be created.
   - `review_notes` (decisions 0041, 0043, 0045): everything one input proposes, lettered as the Review row's Proposed letters them: the **changes** first (every fact change marked ⚠, a new fact as `(new) → <value>`; then new text for a reference; then text added to a note), then the new **notes**, then the **links**. "From Acme launch review: a) ⚠ Launch date on Acme website: 2027-02 → 2027-03, b) Add to Row-level security: Carlos will use RLS…, c) Decision: Use Contentful as the blog CMS, …, h) People on Acme website: Lucía Fernández". End the line with the source and date ("(Acme sync, 3 Dec)"), with no quote: each item has its own `why`, shown when the user asks. Approving applies the changes, makes the notes `reviewed` and applies the links; rejecting archives the notes still `draft` and applies nothing.
   - `answer`: the question and its answer, and the note that answers it: "Who owns the mobile app? → Carlos Ruiz owns it (decision: Carlos owns the mobile app)". Approving closes the question; it shows as Answered in Notion.
   - `notion_change` (a Suggestion from Ultimate Assistant): the row and the Notion field, old → new: "Send the revised quote (task): Status To Do → Done". Approving makes the change in Notion ("Notion writes" below).
   - `set_field` (a Suggestion): the project's Area or the Area's Domain, old → new: "Studio newsletter: Area Clients → Marketing".

   Look up titles with `brain index --json` instead of showing ids. Mention the ones already decided but not applied.
3. **Ask** which to approve, reject or fix. Accept replies like "approve 1 and 3, reject 2, fix 4: 90000 EUR", "approve 5 except b" or "fix 5: a is March, c belongs to Acme app". Fix works on every kind: read the user's words into `fixes` as "Reading What to fix" below says. On a grouped `add_link` or a `review_notes`, "except b" leaves those items out: on a `review_notes` they move to a new pending row (deferred, not rejected). When a reply names a row by its source and two rows share it, the letter or title only one of them has settles it; otherwise ask. **If a reply is unclear, ask again.** Don't guess.
4. **Apply.** Write the input and run `brain apply --input <file>`:
   ```json
   { "decisions": [
     { "proposal": "prp-…", "action": "approve", "decided_at": "<now, ISO 8601 UTC>", "decided_by": "chat" },
     { "proposal": "prp-…", "action": "fix", "note": "90000 EUR", "fixes": [ { "value": "90000 EUR" } ], "decided_at": "<now>", "decided_by": "chat" },
     { "proposal": "prp-…", "action": "approve", "exclude": [ { "field": "people", "value": "per-…" } ], "decided_at": "<now>", "decided_by": "chat" },
     { "proposal": "prp-…", "action": "approve", "note": "all except a, h", "exclude": [ { "change": 0 }, { "target": "per-…", "field": "aliases", "value": "Mari López" } ], "decided_at": "<now>", "decided_by": "chat" },
     { "proposal": "prp-…", "action": "fix", "note": "a is March", "fixes": [ { "change": 0, "value": "2027-03" } ], "decided_at": "<now>", "decided_by": "chat" }
   ] }
   ```
   To apply only what was decided earlier, run `brain apply` with no `--input`.
5. Continue with **Finish** below.

## Notion mode

**Rows with item sections** (rendered since migration 0013: one section per change, a `Decision:` line each, **Submit decisions**) follow [references/review-items.md](references/review-items.md), including how to verify, apply, draft a requested revision and write back. The steps below are for rows of the older layout (the Proposed property, Your call, What to fix), which keep their rules until they are terminal.

1. **Read** the Review database through the Notion MCP: the rows where **Your call** is set and **State** is Pending. Normalize each row into the snapshot format of spec/cli.md §5.14.1:
   - `database: "review"`, the `page_id` and `last_edited`;
   - the properties Name, Kind, Your call, What to fix, State and Brain ID. A space not yet migrated (migration 0009) still has Decision and Note: send them under those names, and the CLI reads them the same way, Edit as Fix.
2. **Plan.** Run `brain sync plan --input <snapshot>`. It writes nothing. Save the reply's **`data` object** (not the whole JSON reply) as the plan file; `sync apply` rejects the full reply. Read:
   - `decisions`: what will be applied;
   - `conflicts`: `NOTE_TO_READ` is an Approve or Reject with text in What to fix, and `FIX_TO_READ` a Fix with its text: read each as "Reading What to fix" below says. `FIX_WITHOUT_TEXT` is a Fix with What to fix empty: the user says what's wrong in Notion (or here);
   - `ignored`: e.g. `ALREADY_TERMINAL`. Nothing to do.
3. **Apply.** Run `brain sync apply --input <plan file>`, adding `--record-only` only for a run that must not apply anything (an unattended catch-up adds `--skip-conflicted` instead, see brain-catch-up). Then apply the decisions you resolved from What to fix with `brain apply --input <file>` (unattended: leave `NOTE_TO_READ` and `FIX_TO_READ` rows for an attended run).
4. Continue with **Finish** below.

## Reading What to fix

What to fix is the user's instruction for that one row, in plain words (decisions 0037, 0045). The CLI never interprets it; you do, and you **never apply a change the text doesn't clearly ask for**. Read the letters against the proposal itself (`brain proposal list --target <a note id>`, then its `changes`, `notes` and `links`), never against what you remember of the row. Letters run over the items in the order of spec/schema.md §11.3: every entry of `changes` (as stored), then `notes`, then `links`; `a` is `{ "change": 0 }` when the row has changes. A letter the row doesn't have → ask. A title works like a letter ("all except the risk"). Every decision you write carries `note` = the text as written, `decided_at` = the row's `last_edited`, `decided_by: notion` (in chat: now and `chat`).

- **Approve with a narrower scope** ("all except b, e", "only Ana"): `approve` with one `exclude` entry per item left out: `{ "change": <index> }`, `{ "note": "<id>" }` or `{ "target", "field", "value" }` on a Review notes row, `{ "field", "value" }` from `links` on an `add_link` row. On a Review notes row the excluded items move to a new pending row; say so in the report.
- **Fix** (Your call is Fix, or an Approve whose text corrects a value: "yes, but it's March"): `fix` with `fixes`, by kind (spec/schema.md §11.3):
  - a fact, a contradiction, text to add, a reference's new text or an answer: one `{ "value": … }`, the corrected value or text. For a fact, write the value in the shape the fact has (`2027-03`, not "March");
  - a supersede or merge: one `{ "value": "<id>" }`, the note it should be instead;
  - a possible new note: `{ "field": "title" | <a frontmatter key>, "value": … }`;
  - an add_link row: `{ "link": { "field", "value" }, "value": <the corrected value> }`;
  - a Review notes row: `{ "change": <index>, "value": … }` for a change ("a: March"), `{ "note": "<id>", "field", "value" }` for a new note ("c belongs to Acme app" → `field: projects`, `value: ["prj-…"]`; a title, summary or area works the same way), `{ "link": { "target", "field", "value" }, "value": … }` for a link ("Lucía is on Acme website, not Acme app").

  A fix and an "except" can come together ("all except b, and a is March"): `fix` with both `fixes` and `exclude`, never on the same item. Names become ids through `brain index --json`; a name that matches no note, or two → ask.
- **Reject with a reason** ("wrong meeting"): `reject`; the reason is kept in `note`.
- **A different change** (a role typed on a link row, a fact about another note) → apply this row as Your call says, and write the other change as its own proposal with `brain proposal new` (`why` = the text, `source` = the proposal's `source`), so it gets its own Review row.
- **Unclear** → ask the user, quoting the text, and leave the row as it is until they answer.

In a catch-up these are decided in its read-only pass and confirmed in its one batch of questions.

## Finish (both modes)

1. **Read the results** of each item:
   - **`applied`:** done.
   - **`awaiting_notion`:** an approved or fixed `notion_change`. Its write is in `data.notion_writes`: carry it out now, as "Notion writes" below says. Without Notion configured or reachable, leave it: the proposal stays `approved`, and the next run that reaches Notion carries it out.
   - **`closed`:** a rejection, or `STALE_PROPOSAL`. Stale means the note changed after the proposal was written (for example your own Notion edit), so the brain did not apply it. Tell the user the current value; the next ingest may propose again.
   - **`recorded`:** decided but not applied (`--record-only`).
   - **`skipped` with `ALREADY_TERMINAL`:** it was already done.
   - **`review_notes` items** also list `notes`, one result each: `reviewed`, `archived` (rejected), `kept_draft` (excluded) and `unchanged` (no longer `draft` when applied: the user changed its Lifecycle in Notion). An applied one lists `changes`, each `applied`, `dropped` (`STALE_PROPOSAL`: its note changed since the row was written, so only that item was closed) or `deferred` (excluded), and `deferred`: the new pending row that holds the excluded items. Name the `kept_draft`, `unchanged`, dropped and deferred items once, under Check.
   - **`failed`:** report the `reason` and `message`. `INVALID_RESULT` means applying it would break a rule, such as a value of the wrong shape. `FIX_UNKNOWN` means a fix named an item the row doesn't have, and `EXCLUDE_UNKNOWN` the same for an "except": re-read What to fix against the proposal. `UNKNOWN_ID` means the proposal or its note is gone.
2. **Rebuild:** run `brain index`, `brain views`, then `brain lint`. If lint reports an error in a file this run changed, stop and report; don't commit.
3. **Commit:** `apply: <n> applied, <n> closed`, listing the proposal titles in the body. If this run does not publish (step 4), push now, per `settings.push` (the brain's AGENTS.md, "Write path").
4. **Publish** *(Notion mode, attended runs only, per `settings.publish`)*. A chat run does not publish: its changes go out with the next Notion-mode run or `brain sync` (spec/cli.md §6, "Apply in chat"). In Notion mode:
   1. Run `brain sync render --changed`, write the pages through the MCP, then `brain sync record`. The steps are the same as in the brain-ingest skill's references/notion.md "Publish": Review rows move to State Applied or Closed, the changed notes are updated, and the notes just approved get their pages (only reviewed knowledge is in Notion, decision 0071; a rejected draft never gets one).
   2. Log it with `brain log publish - pages=<n>`; `sync record` itself does not log (§3.9, §5.14.6).
   3. Commit: `publish: apply results`, then push (same rule as step 3).
5. **Report** in three lines (decision 0037):
   ```
   Done: 8 applied · 1 closed (stale) · 12 pages published
   Needs you: 1 failed ("all except k" on Acme launch review: the row has no k) · 2 rows still pending
   Next: say which item you meant, here or in What to fix
   ```
   - **Done:** counts only, and only the ones that aren't zero.
   - **Needs you:** what failed and why in a few words, a stale proposal with the note's current value, what is still pending. `Needs you: nothing` when there is none.
   - **Next:** one action, or one question.

   **Below the three lines, the report grows with what was applied** (decision 0037, amended 2026-10-18), uncapped, one line each:
   - **What changed:** each applied change in words ("Acme budget is now 95000 EUR", "Ivo joins Acme rollout", "6 notes from Acme launch review accepted", "Who owns the mobile app? answered: Carlos Ruiz").
   - **Fixes:** every correction you read and applied, repeated back with its letter and row ("Acme launch review, a: launch set to 2027-03, not 2027-02"; "c: Use Contentful now belongs to Acme app"), so the user can check you read them right.
   - **Check:** each item or proposal closed as stale, with the note's current value; each deferred row, with what it holds; each failure with its reason in a few words; each What to fix the user should look at again; each change proposed from What to fix. Only things the user can act on: a note the render skipped because it has nothing to publish (its type has no database, or nothing changed) is not a finding.

   A run with nothing applied stops at three lines. Never ids, file paths, commands or commit names: the user reads the report to act in Notion or chat, where those mean nothing.

## Notion writes

A `notion_change` is a change to a Notion-owned field (a task's Status, Due, Project or Area, a project's Status, an Area's Archived), proposed by Ultimate Assistant. The CLI can't write Notion, so `brain apply` and `brain sync apply` record the decision and hand back the write in `data.notion_writes`; the skill that ran them carries out every item, after the apply, and settles it. This is the user's explicit decision, so an unattended catch-up does it too. Until a skill carries out a write the proposal stays `approved` (or `edited`), its row shows Pending, and the next Ultimate Assistant session does it first.

For each item `{ proposal, database, page_id, property, payload, expect, value }`:
1. **Read** the page's `property` through the MCP and normalize it: a status or select its option name (`null` when empty), a date its first 10 characters (`null` when empty), a relation its page ids sorted, a checkbox its boolean. Compare a status trimmed and case-insensitive, a date by its `YYYY-MM-DD`, a relation as a sorted list, a checkbox exactly. A page Notion reports as not found, in the trash or archived, or without the property, can never be written: its result is `stale`, and the confirmation says `<title>: not changed: the page or its <property> is gone from Notion.` Any other failed read is a failed write (step 3).
2. **Equal to `value`:** nothing to write; the result is `applied`. **Equal to `expect`:** update `page_id` with `{ <property>: payload }` (a `status` or `select` payload sets that option by name, a `date` its start, a `relation` the page list, a `checkbox` the box); on success the result is `applied`. **Anything else:** write nothing; the result is `stale` (the user changed it in Notion since), and the confirmation says `<title>: not changed: it changed in Notion since I read it.` (Ultimate Assistant adds `Say "review again" to see it as it is now.`)
3. **A failed write** (the MCP returns an error, or the write can't be confirmed) settles nothing and isn't retried in this run, whatever the error: the proposal stays `approved`, the next run that applies decisions (or the next Ultimate Assistant session) carries it out, and you name it in the report's Needs you line (Ultimate Assistant: in its confirmation line). Read each write's own result, unfiltered, before you settle anything.
4. **Settle:** `brain proposal settle --input` with `{ "settled": [ { "proposal": "<prp id>", "result": "applied" | "stale" } ] }`, one entry per item of steps 1 and 2, then commit the `changed` paths (`apply: <n> Notion changes`). The next `brain sync` pulls the new values into the brain.

In the report, a settled `applied` counts as applied, a `stale` one as closed (stale) with the value Notion holds now, under Check.

## Don'ts

- **Don't apply anything the user didn't decide in this chat or in Notion.** The user's decision is what makes a change to existing knowledge trusted (decision 0003). An undecided proposal stays open, and the report says how many are waiting.
- **Don't edit notes or proposal files directly** (`sed`, a text editor, a script; U-18) to "help" a proposal along, nor to mark one applied. If a proposal is wrong, the user rejects or fixes it, and `brain sync apply` or `brain apply` writes the result.
- **Don't re-run `apply` after a failure** without changing the input. Apply is atomic per item, and the failed item is unchanged; fix the cause first.
