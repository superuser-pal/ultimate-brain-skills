# Step 7: first value, and step 8: the schedule

## Step 7: the first-value check

Setup ends with three checks on the user's own seeded material (decision 0078 §5): **correct tasks, a report, and the information organised**. No meeting is needed. Run each, show its evidence, and ask the user to judge what only they can.

1. **Decide the Review rows first.** The seeded documents' Review rows (seeding.md, "Key documents") are part of this step: "Your documents left <n> rows in Review. Open Review in Notion and approve, edit or reject them, then say "done"." Then run the brain-catch-up skill, or brain-apply, to carry out what they decided. With no seeded document, the tasks check has nothing to read: offer to take one now (seeding.md, "Key documents"); without one, the tasks check is `fail` (no document), and the report check runs on what the brain has.
2. **Correct tasks** (Tasks on). Show the tasks the ingest created from one seeded document, each with its Project and Due. Ask: "Are these exactly your own commitments in <document>, with the right project and due date, and none of someone else's?" Yes: `tasks=pass`. No: `tasks=fail`, and note what was wrong (a missing task, someone else's task, a wrong project or date) for the report as a count, never the text. With Tasks off: `tasks=skip`.
3. **A report.** Ask the user to say "report on <main project>" (the brain-query skill, report mode), or run it with their yes. Check that the report landed in Documents, linked from the project, and cites the seeded document. All three: `report=pass`; else `report=fail` and which of the three is missing.
4. **The information organised.** List each note the seeding and the documents' Review wrote, under its Area and Project:

   ```text
   Clients
     Harbor Lane renovation: 2 decisions, 1 question, 1 Document
     People: Robin Vale, Jamie Ortiz, Kim Okafor
   Family
     Garden redesign: 1 Document
   ```

   Ask: "Is each where you expect it, and is anyone listed twice?" Yes: `organised=pass`. No: `organised=fail`, and note what was misplaced or duplicated.
5. **Log** `step=first-value result=done tasks=<pass|fail|skip> report=<pass|fail> organised=<pass|fail>`, commit. Each check passes or fails on its own. A failure is named to the user and not retried in setup: it goes in the setup report, and the user can say "that's wrong: …" to fix it the usual way. The step is done when the three were run.

**The first meeting** is checked later, by the first catch-up that ingests a Reviewed meeting after this step: its report adds one line saying how it went. Tell the user: "Your first meeting is the last check: mark it Reviewed after it's summarised, and the next catch-up tells you how it went."

## Step 8: the scheduled catch-up

Offered only now, once first value works (decision 0078 §2).

Ask: "Catch-up can run on its own at set times, taking in only what you've marked ready. Turn it on? (You can change this any time.)"

- **On:** run the brain-catch-up skill's "Run on a schedule" (its times, days, model and allow list). When `brain schedule install` succeeds: `brain config set settings.schedule '"on"'`, log `step=schedule result=done`, commit. When it fails: say why, leave `settings.schedule` as it was, log nothing, and offer to try again or choose off.
- **Off:** `brain config set settings.schedule '"off"'`, log `step=schedule result=declined`, commit. Never asked again; "run catch-up every morning" turns it on later.

Then go on to the setup report (report.md).
