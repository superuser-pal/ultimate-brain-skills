# Judging, and the prose

Step 6 of a run (the correction targets, then the reflection clusters, within the budget) and the two sections of step 9 the skill writes. Everything here reads only what `plan` gave and what `brain query --read <id>,<id>,… --json` returns (at most 20 ids a call); count every note you read in `notes_read`.

**The budget comes first.** Before each correction target and each cluster: when `date +%s` is `settings.weekly.minutes` × 60 past the run's start, or the targets and clusters judged reach `settings.weekly.max_judged`, stop judging and go to step 7 with what you have. Omitted targets and clusters are counted by the CLI and carried to next week; don't list them as judged.

## 1. The correction targets

The plan's `corrections` lists the **claims**: facts, superseded decisions, titles and rules that changed (`claim`, `kind`, `note`, `title`, `old`, `new`, `date`, `source`, `why`, `passages`), oldest first, each with its candidate `targets` (`note`, `title`, `field`, `line`, `line_after`, `before_hash`, `pending`). Judge them in that order, claim by claim, target by target. Skip a target whose `pending` is set: it is already in Review, and judging it again is refused.

Read the target note, and judge its `line` (or, with `field` set and `line` null, its fact) as one of:
- **`restatement`:** the line asserts the old value as current, and nothing else in the note supports it. Only when the fix is the new value in place of the old one with nothing else changed: `line_after` is set, or the target is a fact (`field` set). A target with `line_after` null and no `field` is never a restatement.
- **`independent`:** the line has its own cited support (a source marker, or a link to a source or meeting other than the corrected one), or it is about another thing that shares the words.
- **`historical`:** the line reports the past ("in January we planned 12k").
- **`uncertain`:** it matters, and you can't settle it, including a restatement whose fix would need more than swapping the value. It is not drafted: the report names it as needing clarification.

A **rule** claim (`kind: rule`, no `old`) lists lines that share its words. A line that contradicts the rule is `uncertain` (it can't be swapped); one that doesn't is `independent`.

Each verdict is one entry of `judged.corrections`: `{ "claim": "<claim>", "note": "<target note>", "verdict": "<restatement|independent|historical|uncertain>" }`. A target you didn't reach is left out (omitted, carried). `select` builds the correction group and hands its exact `proposal new` input over: you write nothing for a correction yourself.

## 2. The reflection clusters

The plan's `clusters`, in their order (carried ones first, then by `rank`), each judged as brain-reflect references/judging.md says: the finding kinds, the reading by signal, the proposal's fields and the held findings. A cluster that shows nothing wrong gives no finding. Every cluster you judged goes in `judged.clusters`, a finding drawn or not.

Each finding is one entry of `judged.findings`:

| Field | Value |
|---|---|
| `cluster` | the cluster's `key` |
| `kind` | `contradiction`, `stale`, `duplicate`, `promotion` or `theme` |
| `fingerprint` | as brain-reflect's judging.md gives it (`contradiction:<target>:<field>`, `stale:<target>:<field>`, the cluster's `merge:…` or `theme:…`, `promotion:<target>:<source>`) |
| `targets` | the note the proposal is on; a duplicate: `[<target>, <survivor>]`; a theme: `[<the newest input of its evidence>]`, since its Document doesn't exist yet |
| `evidence` | the cluster's `evidence` ids (meetings and sources), sorted and unique; `[]` for `shared_ground` and `near_duplicate` |
| `subject` | at most 120 characters: `<title> (<type>): <fact in words>` (`Harbor app (project): launch date`), `<target title> and <survivor title> (<plural>)` for a duplicate, the term for a theme |
| `decide` | at most 120 characters, what the user decides: `2027-01 here, March in the 4 Nov decision: which holds?`, `set role to "former designer at Quarry"?`, `merge M. Lopez into Mara Lopez?`, `add "Every release needs legal's sign-off"?`, `keep a Document on pricing tiers?` |

Keep, in the run record, the whole proposal each finding would write (brain-reflect's judging.md, "The proposal's fields", with `fingerprint` and `evidence`): step 8 writes it when `select` makes the finding an item. A contradiction keeps both values: the run never picks one.

## 3. The prose

`record` checks both sections and refuses what doesn't fit (`INPUT_INVALID` with a pointer, `WEEKLY_TOO_LONG` over 450 words). Links are relative to the report, which lives in `reports/`: a note at `knowledge/decisions/x.md` is `../knowledge/decisions/x.md`. A task is linked by its `url` from the plan.

### What changed

One bullet for each change of `changes` with `bullet: true`, at most 8, grouped by label in this order: `Decided:` (`decided`), `Changed:` (`changed`), `Open:` (`open`), `Answered:` (`answered`), `Next:` (`next`); within a label, newest first. Each bullet is one line:

```text
- **Decided:** launch the Harbor app in March, not January ([Launch Harbor app in March](../knowledge/decisions/2026-11-04-launch-harbor-app-in-march.md), 4 Nov).
- **Changed:** Quarry website's budget is 18k, was 12k ([Quarry website](../projects/quarry-website/project.md), 5 Nov) *(not reviewed)*.
- **Open:** who signs off the Harbor security review? ([question](../knowledge/questions/harbor-security-sign-off.md), 6 Nov).
- **Next:** send the Quarry estimate ([task](https://www.notion.so/2b8c4d6e1f3a4b5c8d7e9f0a1b2c3d4e), 13 Nov).
```

- Say what changed in a few plain words, from the change's `title` and, for `changed`, its `field`, `before` and `after`. Read the note only when those don't say it.
- Every bullet links the note (`path`) or the task (`url`) it rests on, and carries its `date` as `<D Mon>`.
- A change with `draft: true` ends ` *(not reviewed)*` before the final full stop.
- With no bullet to write: the one line `- Nothing new this week.`. The changes not shown are counted by `record` in the header; never list them.

### Task analysis

From the plan's `task_analysis`: `overdue`, `stalled`, `blocked`, `no_next_step` (each up to 3 subjects with `title`, `url` and `evidence`) and `order` (up to 3, in the assistant's rank).

```text
- **Overdue:** "Send the logo proposals", 8 days late; "Update the case studies", 3 days late.
- **Stalled:** Pinecrest signage (project): nothing done or mentioned for 40 days.
- **Blocked:** "Get the tiler's quote" has waited since 20 Oct.
- **No next step:** Conference talk proposal.

Order of attention:
1. Send the logo proposals: the client meeting on Thursday depends on them.
2. Pinecrest signage: 40 days without movement.
3. Conference talk proposal: the call for papers closes on 30 Nov.
```

- One bullet per category that has subjects, in the order Overdue, Stalled, Blocked, No next step, each listing its subjects with their evidence in few words. A task's title is in quotes.
- Then an empty line, `Order of attention:`, and one numbered line per `order` subject (1 to 3): `<title>: <reason>`. Write the reason from evidence this run read: a due date, a meeting that depends on it, a decision. Don't estimate anyone's time or capacity. With no reason you can support, the line keeps the subject and its `evidence` text.
- With no subject in any category: the one line `- No overdue, stalled or blocked work.`, and no order.
- These lines change nothing: no priority, date or status.

### Shorter, when `record` says it is too long

Shorten your own lines and run `record` again: fewer words in each bullet and in each reason of the order of attention. Keep every What changed bullet: a change marked `bullet: true` that you drop would be neither shown nor counted. Never touch What needs your decision: `record` renders it.
