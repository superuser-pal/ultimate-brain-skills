# Step 7: first value, and step 8: the schedule

## Step 7: the first-value check

Setup ends with four checks on the user's own seeded material (decision 0078 §5, and the loop the brain is for: capture, review, a cited answer): **correct tasks, a report, the information organised, and a cited answer**. No meeting is needed. Run each, show its evidence, and ask the user to judge what only they can.

**An attempt is not a pass.** Running the checks records an attempt. First value passes only when every applicable check passes; until then it is unresolved, setup stops at this step, and the schedule is not offered.

### Each check's outcome

- `pass`: the check passed, and the user confirmed what only they can judge.
- `fail`: it ran and something was wrong. Name what ("this task is someone else's commitment", "the person appears twice").
- `unsuitable`: the material can't show it: no seeded document holds a commitment of the owner, there is no main project to report on, a document's parts held no item to accept, or no useful question can be answered from the accepted item. Say why. **Never invent** a commitment, a proposal, a Review item or an answer to pass a check.
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

### Before the checks: the seeded documents' parts

Each seeded document was taken in part by part, in the session (seeding.md, "Key documents"; brain-ingest references/parts.md). The `answer` check needs one item from them accepted. When the user left a document's parts for later, ask them now, when a check that needs them is to run, as brain-apply asks a source's waiting notes ("From <document>: <subject> (3 notes, 1 addition): accept all, all except …, or reject?"), and apply the answer. With no seeded document, offer to take one now (seeding.md, "Key documents"); without one, `tasks` and `answer` are `unsuitable` (no document). A document taken in this step goes through the ingest as usual, with its own publish question (`settings.publish`); it writes no new `seeding` line, so the checks already passed are kept. The same offer applies when the seeded documents' parts were answered with nothing accepted: the `answer` check needs another document, or the user's yes to an item they rejected, taken again as a new input.

### The four checks

1. **Correct tasks** (`tasks`, Tasks on). Show the tasks the ingest created from one seeded document, each with its Project and Due. Ask: "Are these exactly your own commitments in <document>, with the right project and due date, and none of someone else's?" Yes: `pass`. No: `fail`, and name what was wrong (a missing task, someone else's task, a wrong project or date). No seeded document holds a commitment of the owner: `unsuitable`, and the smallest next action is to drop a document that holds one of their commitments. With Tasks off: `skip`.
2. **A report** (`report`). Ask the user to say "report on <main project>" (the brain-query skill, report mode), or run it with their yes. It passes when the report landed in Documents, linked from the project, citing a seeded document; else `fail`, naming which of the three is missing. No main project: `unsuitable`.
3. **The information organised** (`organised`). List each note the seeding and the documents' parts wrote, under its Area and Project:

   ```text
   Clients
     Harbor Lane renovation: 2 decisions, 1 question, 1 Document
   Family
     Garden redesign: 1 Document
   People, by Org
     Harbor Lane Homes: Robin Vale, Jamie Ortiz, Kim Okafor
   ```

   People have an Org and no Area, so they are listed by Org (no Org: `no org`). Ask: "Is each where you expect it, and is anyone listed twice?" Yes: `pass`. No: `fail`, naming what was misplaced or duplicated.
4. **A cited answer** (`answer`). Name the item the user accepted from a seeded document's parts and applied. Ask: "Ask me one question about it that you'd really ask." Answer with the brain-query skill, showing the answer and the source passage it cites. It passes when the answer rests on the applied item and cites the seeded document, and the user confirms the answer is useful and the passage supports it; else `fail`, naming which. No item accepted from a seeded document, or no useful question can be answered from it: `unsuitable`.

A published report that cites a document does not show by itself that an answer is useful and supported: that is the fourth check's job.

### Log the attempt

When the attempt's checks are done, or the user stops, write one line with each check's outcome as it stands, carrying the kept ones unchanged:

- **First value passes** (`report`, `organised` and `answer` are `pass`, and `tasks` is `pass` or, with Tasks off, `skip`): log `step=first-value result=done tasks=… report=pass organised=pass answer=pass`, commit `setup: first-value`, and go on to step 8.
- **Otherwise, unresolved:** log `step=first-value result=failed reason=first-value-unresolved` with the checks as they stand (a check not run is left out), commit, and stop at step 7. Show one line per check not passed: what failed or couldn't be shown, the smallest next action, and how to resume:

  ```text
  First value isn't there yet:
  - organised: Robin Vale appears twice. Next: say "merge the two Robin Vale notes".
  - answer: no item from your documents was accepted. Next: say "what needs my decision" and accept one.
  Say "set up my brain" when that's done: I'll check only these two again.
  ```

  Offer no schedule, and write no `finished` line. The setup report can still be shown (report.md); it unlocks nothing.

**The first meeting** is checked later, by the first catch-up that ingests a Ready meeting once first value has passed: its report adds one line saying how it went. When first value passes, tell the user: "Your first meeting is the last check: set it Ready after it's summarised, and the next catch-up tells you how it went."

## Step 8: the schedule

Offered only once first value passes (decision 0078 §2), on macOS and on Windows alike (decision 0110 §8, §9; before 0.17.0 Windows wasn't offered it). A brain whose `schedule` line says `declined` with `reason=schedule-unsupported` (Windows before 0.17.0) is offered it once now.

Follow brain-catch-up's [schedule reference](../../brain-catch-up/references/schedule.md) for **both jobs at once**, in one message:
1. **The two slots, with their defaults:** `Run the weekly review on its own every Monday at 08:00, and a catch-up every day at 07:30? Keep them, change a time or a day, or say no to either.` A changed time or day is taken as said; a slot the user declines is `off`.
2. **The agent and its model:** the agent is the one you are running setup in (Claude Code or Codex); offer its model as the reference says (with Claude Code a Sonnet full id, with Codex the model you are running as, by its full name); the user may name another.
3. **The offers,** once each: `settings.publish: auto` when it is `ask`, and with Claude Code the allow list for the jobs kept, then the folder-trust step.
4. **What the computer needs,** by platform, and that the schedule runs on this computer only.

Then install as the reference's step 4 says: `brain schedule install <job> --at … [--days …] --agent <agent> --model <id>` for each kept slot (the first with `--agent` and `--model`), `brain schedule remove <job>` for a declined one once the object exists, and with both declined `brain config set settings.schedule '"off"'`. Commit `brain.json` (and `.claude/settings.json` when it changed).

- **Done** (one slot or both installed): log `step=schedule result=done`, commit.
- **Both declined:** log `step=schedule result=declined`, commit. Never asked again; "schedule my brain" turns it on later.
- **An install fails:** say why in one line (the reference's "What `install` answers"), log `step=schedule result=failed reason=<code>` (`AGENT_NOT_FOUND`, `BRAIN_NOT_GIT`, or `schedule-not-loaded` for `SCHEDULE_NOT_LOADED`), and offer to try again or decline. The slots stay written in `brain.json`, so "schedule my brain" installs them once the cause is fixed.

Then go on to the setup report (report.md).
