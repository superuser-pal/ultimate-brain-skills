# Step 7: first value, and step 8: the schedule

## Step 7: the first-value check

Setup ends with four checks on the user's own seeded material (decision 0078 §5, and the loop the brain is for: capture, review, a cited answer): **correct tasks, a report, the information organised, and a cited answer**. No meeting is needed. Run each, show its evidence, and ask the user to judge what only they can.

**An attempt is not a pass.** Running the checks records an attempt. First value passes only when every applicable check passes; until then it is unresolved, setup stops at this step, and the schedule is not offered.

### Each check's outcome

- `pass`: the check passed, and the user confirmed what only they can judge.
- `fail`: it ran and something was wrong. Name what ("this task is someone else's commitment", "the person appears twice").
- `unsuitable`: the material can't show it: no seeded document holds a commitment of the owner, there is no main project to report on, a document's Review row holds no item to accept, or no useful question can be answered from the accepted item. Say why. **Never invent** a commitment, a proposal, a Review item or an answer to pass a check.
- `skip`: `tasks` only, with the Tasks module off. Show it as `skipped (Tasks off)`, never as a pass.
- Not run in this attempt (the user stopped first): left out of the log line.

### Which checks to run

Read the latest `first-value` attempt: `setup.first_value` in `brain status` (`at` and the four outcomes, `null` for a check not run yet) or, when `status` has no `first_value`, the latest `first-value` log line.

- **No attempt yet:** run all four.
- **An unresolved attempt:** keep the checks that passed and run only the others (`fail`, `unsuitable`, or not run yet).
- **Run all four again** when a `seeding` line is newer than that attempt (the material changed); run `tasks` again when it was `skip` and the Tasks module is now on.
- **The Tasks module turned off since:** a `tasks` check not passed becomes `skip`, without running.
- The user can ask for any check again ("check the report again"); then it runs whatever it was.

Say in one line which checks are kept and which run: "Kept from last time: tasks, report. Checking now: organised, answer."

### Before the checks: the seeded documents' Review rows

The seeded documents left one Review row per file (seeding.md, "Key documents"). The `answer` check needs one item from them accepted, so ask now, when a check that needs them is to run: "Your documents left <n> rows in Review. Open Review in Notion, approve or reject what's there (accept at least one item you'd want the brain to know), then say "done"." Then carry out what the user decided with the brain-apply skill (or brain-catch-up). With no seeded document, offer to take one now (seeding.md, "Key documents"); without one, `tasks` and `answer` are `unsuitable` (no document). A document taken in this step goes through the ingest as usual, with its own publish question (`settings.publish`); it writes no new `seeding` line, so the checks already passed are kept. The same offer applies when the seeded documents' rows were decided with nothing accepted: the `answer` check needs another document, or the user's yes to an item they rejected, taken again as a new input.

### The four checks

1. **Correct tasks** (`tasks`, Tasks on). Show the tasks the ingest created from one seeded document, each with its Project and Due. Ask: "Are these exactly your own commitments in <document>, with the right project and due date, and none of someone else's?" Yes: `pass`. No: `fail`, and name what was wrong (a missing task, someone else's task, a wrong project or date). No seeded document holds a commitment of the owner: `unsuitable`, and the smallest next action is to drop a document that holds one of their commitments. With Tasks off: `skip`.
2. **A report** (`report`). Ask the user to say "report on <main project>" (the brain-query skill, report mode), or run it with their yes. It passes when the report landed in Documents, linked from the project, citing a seeded document; else `fail`, naming which of the three is missing. No main project: `unsuitable`.
3. **The information organised** (`organised`). List each note the seeding and the documents' Review wrote, under its Area and Project:

   ```text
   Clients
     Harbor Lane renovation: 2 decisions, 1 question, 1 Document
   Family
     Garden redesign: 1 Document
   People, by Org
     Harbor Lane Homes: Robin Vale, Jamie Ortiz, Kim Okafor
   ```

   People have an Org and no Area, so they are listed by Org (no Org: `no org`). Ask: "Is each where you expect it, and is anyone listed twice?" Yes: `pass`. No: `fail`, naming what was misplaced or duplicated.
4. **A cited answer** (`answer`). Name the item the user accepted from a seeded document's Review row and applied. Ask: "Ask me one question about it that you'd really ask." Answer with the brain-query skill, showing the answer and the source passage it cites. It passes when the answer rests on the applied item and cites the seeded document, and the user confirms the answer is useful and the passage supports it; else `fail`, naming which. No item accepted from a seeded document, or no useful question can be answered from it: `unsuitable`.

A published report that cites a document does not show by itself that an answer is useful and supported: that is the fourth check's job.

### Log the attempt

When the attempt's checks are done, or the user stops, write one line with each check's outcome as it stands, carrying the kept ones unchanged:

- **First value passes** (`report`, `organised` and `answer` are `pass`, and `tasks` is `pass` or, with Tasks off, `skip`): log `step=first-value result=done tasks=… report=pass organised=pass answer=pass`, commit `setup: first-value`, and go on to step 8.
- **Otherwise, unresolved:** log `step=first-value result=failed reason=first-value-unresolved` with the checks as they stand (a check not run is left out), commit, and stop at step 7. Show one line per check not passed: what failed or couldn't be shown, the smallest next action, and how to resume:

  ```text
  First value isn't there yet:
  - organised: Robin Vale appears twice. Next: say "merge the two Robin Vale notes".
  - answer: no item from your documents was accepted in Review. Next: accept one item in Review.
  Say "set up my brain" when that's done: I'll check only these two again.
  ```

  Offer no schedule, and write no `finished` line. The setup report can still be shown (report.md); it unlocks nothing.

**The first meeting** is checked later, by the first catch-up that ingests a Reviewed meeting once first value has passed: its report adds one line saying how it went. When first value passes, tell the user: "Your first meeting is the last check: mark it Reviewed after it's summarised, and the next catch-up tells you how it went."

## Step 8: the scheduled catch-up

Offered only once first value passes (decision 0078 §2).

Ask: "Catch-up can run on its own at set times, taking in only what you've marked ready. Turn it on? (You can change this any time.)"

- **On:** run the brain-catch-up skill's "Run on a schedule" (its times, days, model and allow list). When `brain schedule install` succeeds: `brain config set settings.schedule '"on"'`, log `step=schedule result=done`, commit. When it fails: say why, leave `settings.schedule` as it was, log nothing, and offer to try again or choose off.
- **Off:** `brain config set settings.schedule '"off"'`, log `step=schedule result=declined`, commit. Never asked again; "run catch-up every morning" turns it on later.

Then go on to the setup report (report.md).
