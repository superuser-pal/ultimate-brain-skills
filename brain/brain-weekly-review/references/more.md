# "weekly review more" and "weekly review corrections"

Two attended paths, on request, outside the weekly limits (decision 0075 §2 and §4): what they show is answered in this chat, so it is no weekly decision item. Neither runs unattended: asked with nobody there, say `This runs only when you ask in a chat.` and stop. Both start with step 1 of the run (preconditions, the working branch).

## "weekly review more"

The findings the last report couldn't fit. `_weekly/state.json`'s `queued` lists them (`key`, `week`); take the entries of the latest `week`. With none: `Nothing is waiting from the last review.`, and stop.

Sort the keys by stream:
- **work** (an assistant finding key, such as `task_overdue:notion:…` or `project_stalled:prj-…`): run the ultimate-assistant skill's session for them. Its steps 1 to 5 give the findings (the snapshot, `brain assistant findings`); show only the queued ones by passing every other finding key in `--exclude`, and continue that session as the skill says ("yes 1, 2b", "propose 3", "skip 4 because …", "done").
- **knowledge** (a fingerprint: `contradiction:`, `stale:`, `merge:`, `promotion:`, `theme:`): say `<n> findings about your notes wait: say "tidy the brain" to go through them.` The brain-reflect skill shows them ranked and answers them in this chat.
- **corrections** (`correction:<claim>`): say `<n> corrections wait: say "weekly review corrections".`

Show the work report first, then the other two lines. Nothing in `_weekly/state.json` changes: next week's review finds what is still open on its own.

## "weekly review corrections"

Every queued correction check at once, report first, 10 claims at a time, answered as brain-reflect answers a finding.

1. `brain weekly corrections list` (`--offset <n>` for the next page). Each claim has `claim`, `kind`, `note`, `title`, `old`, `new`, `date`, `source`, `why`, `passages` and its `targets`. With none: `No correction checks are waiting.`, and stop.
2. Judge each claim's targets as judging.md, §1 says (`restatement`, `independent`, `historical`, `uncertain`), reading each target note once; a target with `pending` set is already in Review.
3. **The report**, one block per claim, numbered from 1 for the session:
   ```text
   Corrections · 14 Nov 2026

   1. Harbor app budget: 12k → 18k (changed 5 Nov) · 3 notes still say 12k
      a) Harbor launch plan (Document): "The app is built on the 12k budget." → "The app is built on the 18k budget."
      b) Lena Hart (person): "Owns the Harbor budget of 12k." → "Owns the Harbor budget of 18k."
      Not changed: Harbor kickoff (meeting: history); Studio costs (Document: its own source). Needs clarification: Studio plan (project): "about 12k a quarter".

   Answer "yes 1", "yes 1a", "later 1", "skip 1b", or "done".
   ```
   Each restatement is a lettered line with its change; the other verdicts are named on the last line of the block, not drafted.
4. **The answers,** by claim or by letter:
   - **yes** writes the claim's group, pending, for the user to decide in Review: one `proposal new` with the `review_notes` and one change per restatement named, in the shape `select` gives a weekly group: `{ "kind": "review_notes", "title": "Correction: <claim title> <field>: <old> → <new> (<size> notes)", "notes": [], "why", "source", "correction": "<claim>", "needs_clarification": [ { "note", "line" } ] }` (the last only with uncertain matches), then for each target `{ "kind": "replace_line", "title": "<target title>: <old> → <new>", "target", "line_before": <line>, "line_after": <line_after>, "why", "source", "passages", "correction" }`, or for a fact `{ "kind": "update_fact", "title", "target", "field", "after": <new>, "why", "source", "passages", "correction" }`. `<field>` is the fact's key in words, `title`, `decision` or `rule`; `<size>` counts the restatements and the uncertain matches. Never apply it. Confirm `1: proposed; it will be in Review once I publish.`
   - **later** keeps the claim (or the target) queued.
   - **skip** finishes the target with no proposal.
5. **Done** (the user says so, or turns to something else): `brain weekly corrections done --input <base>.corrections.json` with `{ "claims": [ { "claim": "<claim>", "open": [<the targets left for later>] } ] }`, every claim the chat went through, `open: []` for a finished one. Then `brain index`, `brain views`, `brain lint`, publish the groups written (SKILL.md, "Publishing", step 1, under `settings.publish`), commit the proposals, `_weekly/state.json` and the log file (`weekly: corrections`), and push per `settings.push`. Close with one line: `Done: <n> groups proposed, <n> skipped, <n> left for later.`
