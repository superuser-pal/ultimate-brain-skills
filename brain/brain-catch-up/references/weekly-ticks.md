# Your ticks in a Ready Weekly row

Read by brain-catch-up when a Weekly row is **Ready** (decision 0110 §4), and when the user says "undo clean-up U2". The weekly review writes the week's row with **Actions** (`A1`…), **clean-up items to tick** (`C1`…) and **Already cleaned** (`U1`…); the user ticks what they agree with, may write on an item's **Your note:** line, and sets the row Ready. A catch-up applies it. A Weekly row is a request, never an input: it isn't ingested and doesn't count in the budget.

A tick is the user's yes to the change it shows (a tick on a `U` item asks for its undo). Ready is the go: a row still **New** is never read for ticks.

## Step 1.13: the read-only pass

For each Inbox row of Kind Weekly with Brain Status **Ready** (with a Brain ID): read its to-dos as brain-weekly-review [references/row.md](../../brain-weekly-review/references/row.md) says, and write the `cleanup ticks` input for it in the run's temporary folder: `{ "week", "page", "read_at", "items" }`. Note, for the batch:
- the items with a note (`note` not empty);
- the plain ticks, by label, for the opening line ("I'll apply what you ticked in Week of 9 Nov: A1, C2, C4; undo U1").

**Does the row wait?** It counts as waiting work (for "nothing waiting", and for the unattended no-op rule) when one of its items is not decided yet: `brain proposal list --status pending` holds a proposal whose `weekly` is the row's week, or a `U` to-do is ticked whose clean-up is not undone yet (its proposal, named in `_weekly/state.json` under `weeks.<week>.row.<label>`, is still `applied`). A Ready row with nothing undecided waits only for its publish (step 4.1.1c), which sets it Done.

## Step 2: the batch

The plain ticks need no question: they are the user's answer. Each **item with a note** is one batch question, under the row's name, worded from the item, the note and your reading of it, with that reading as the default:

```text
Week of 9 Nov 2026
 3. C2 · Move Quarry website to Clients. Your note: "only if the client signs this week".
    I read it as: wait; the client hasn't signed (no meeting or task says so). (default: leave it for next week)
 4. A1 · Add the next step "Draft the talk outline". Your note: "call it 'Outline the talk'".
    I read it as: add the task as "Outline the talk". (default: yes, with your words)
```

Your reading is a proposal to the user, shown in full: apply only what they confirm ("go" confirms each default). A note you can't turn into a change shown in full (it asks for something else, or for a value you can't tell) has the default "leave it", and the item stays pending.

## Run step 1c: apply the ticks

After Run step 1's `sync apply` and its questions, for each Ready Weekly row, in week order:

1. `brain cleanup ticks --input <its file> --attended`. Each item comes back with its `result`:
   - `applied`: a plain tick applied after the stale check (`decided_by: tick`);
   - `stale`: not applied, because its note or file changed since the row was written; its proposal is closed. Name it under Check: `C3 not applied: <its subject> changed since the review.` (a `U` item: see `undone`);
   - `undone` (a ticked `U`): restored, staged with this step's other writes. `stale` with reason `UNDO_STALE`: a file the clean-up wrote changed since, and nothing was restored. Say which paths changed and offer to put it back by hand in this session;
   - `ask`: an item with a note. Apply the batch's answer with `brain apply`, `decided_by: chat`, `note` = the Your note text, then the user's answer (brain-apply, step 3: approve, a fix with its words, or reject). An item the user left for later gets no decision;
   - `kept` (an unticked `U`: the clean-up stays), `already` (decided before), `open` (unticked while something else in the row waits), `skipped` (`UNKNOWN_LABEL`, a to-do the row's state doesn't know: name it under Check), `failed` (a failure of the run: name it, and the item stays pending).
2. Once every `ask` item has its decision, run `brain cleanup ticks` again with the **same file** and `--attended`: the items now decided are `already`, and an item still unticked is `declined` (rejected with `decided_by: tick`; it comes back only on new evidence).
3. **Notion writes:** carry out the `notion_writes` of both runs and of each `brain apply` through the MCP and settle them (brain-apply, "Notion writes"): a ticked new task is created in Tasks (with Tasks off, an Inbox capture instead), a project status is set.
4. `brain index`, `brain views`, `brain lint`, and commit the paths written: `catch-up: weekly ticks <week> (<n> applied)`. A lint error in a file this step wrote stops the run, as everywhere.

`done` true in the last answer means nothing in the row waits: the publish sets it Done.

## Step 4.1.1c: publish the row

After the pages (step 4.1.1), for each Weekly row read this run: read its to-dos again (row.md: just before), write them as the row state, and `brain sync render --ids <the week's report id> --row-state <file> --plan plan.json`. Write the item, then `brain sync record`. Render sets Brain Status `Done` when nothing in the row waits, and keeps every tick and note. The run's `sync render --changed` skips a Weekly row with `ROW_STATE_REQUIRED`: that is expected, and this step publishes it. The report's id is the Brain ID the row carries.

## The report

On the Done line, one line per row: `Week of 9 Nov: 3 applied, 1 undone, 2 declined.` Under Needs you, each item that still waits: `C2 (Week of 9 Nov) waits: you wrote a note; say "catch up" in a session.` Under Check, the stale and skipped items.

## Unattended

A scheduled run reads the Ready rows in its read-only pass the same way, and asks nothing:
- `brain cleanup ticks --input <its file>` **without** `--attended`: plain ticks applied after the stale check, unticked items declined only when nothing else in the row waits, ticked `U` items undone. An item with a note is `waiting`: an unattended run interprets nothing the user wrote (decision 0051); name it under Needs you. With `settings.publish: ask`, a ticked new task or project status is `waiting` too (`PUBLISH_ASK`): nothing is written to Notion; name it.
- With `publish: auto`, carry out the `notion_writes` and settle them, then step 4.1.1c publishes the row.
- Commit as in Run step 1c, step 4. No second `ticks` run: the attended catch-up that answers the noted items runs it.

## Undo a clean-up, in a session

When the user says "undo clean-up U2" (or names the item: "put back the draft you archived"):
1. `brain status` (the working branch, as at the start of any run). Find the item: this week's report (`unattended.weekly.report`) and `_weekly/state.json`'s `weeks.<week>.row.<label>.proposal` give its proposal; for an earlier week, the user names the week. With no such item, say so and stop.
2. `brain cleanup undo <proposal>`. It restores the files as they were before the clean-up and commits (`Undo clean-up: <title>`).
   - `UNDO_STALE`: a file it wrote changed since; nothing was written. Say which, and offer to restore it by hand in this session (a change you show and the user says yes to, as any change).
   - `ALREADY_UNDONE`: say it was undone already. `NOT_A_CLEANUP`: that item wasn't applied by the clean-up.
3. `brain index`, `brain views`, `brain lint`, and commit what they change: `undo clean-up: <title>`. Push per `settings.push`.
4. Say it in one line: `Undone: <title>. It won't be cleaned up alone again.`
