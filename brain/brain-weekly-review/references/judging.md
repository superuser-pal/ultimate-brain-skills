# Judging, and the prose

Step 6 of a run (the correction targets, then the reflection clusters, within the budget, then the next steps) and the prose of Your week that step 9 writes (In short, the Highlights, Focus first). Everything here reads only what `plan` gave and what `brain query --read <id>,<id>,… --json` returns (at most 20 ids a call); count every note you read in `notes_read`.

**The budget comes first.** Before each correction target and each cluster: when `date +%s` is `settings.weekly.minutes` × 60 past the run's start, or the targets and clusters judged reach `settings.weekly.max_judged`, stop judging and go to step 7 with what you have. Omitted targets and clusters are counted by the CLI and carried to next week; don't list them as judged.

## 1. The correction targets

The plan's `corrections` lists the **claims**: facts, superseded decisions, titles and rules that changed (`claim`, `kind`, `note`, `title`, `old`, `new`, `date`, `source`, `why`, `passages`), oldest first, each with its candidate `targets` (`note`, `title`, `field`, `line`, `line_after`, `before_hash`, `pending`). Judge them in that order, claim by claim, target by target. Skip a target whose `pending` is set: it already waits for a decision in the session, and judging it again is refused.

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

## 3. The next steps

The plan's `findings` with the kind `project_no_next_step` (a live project with no open task) can become an **Action**, "Add the next step "<words>" to <project>", but only when the project's own notes and inputs give a next step you can cite (decision 0110 §2, weekly-review.md §6.1). Otherwise the project stays in Focus first only. They are not counted in `weekly.max_judged`, but the time budget still applies: stop when it runs out.

For each such finding, in the plan's order, read the project and the inputs its evidence names (`brain query --read`), and look for a step someone said would come next, or the one the project's open question or last decision calls for. When you find one, add to `judged.next_steps`:

```json
{ "key": "project_no_next_step:prj-4k8m2q7x", "task_title": "Draft the talk outline", "why": "no next step since 30 Oct; the 28 Oct call agreed the outline comes first (Talk prep call, 28 Oct)" }
```

- `task_title`: one line, the task's words, as the user would write a task: a verb first, at most 80 characters. Only what a note or an input says; never a step you made up to fill the line.
- `why`: the finding's evidence in a few words, then the note or input the step comes from, with its title and date.
- With nothing you can cite, leave the finding out: `select` keeps it in Focus first only.

`select` makes an Action only of a finding listed here, and hands over its `new_task` as `proposal_input` (proposals.md).

## 4. The prose

`record` checks Your week and refuses what doesn't fit (`INPUT_INVALID` with a pointer, `WEEKLY_TOO_LONG` when Your week is over 450 words, its to-dos and link targets not counted). Links are relative to the report, which lives in `reports/`: a note at `knowledge/decisions/x.md` is `../knowledge/decisions/x.md`. A task is linked by its `url` from the plan. You write three things; `record` renders the rest (Done this week, the Actions, Waiting for you, the Clean-up).

### In short (`in_short`)

One or two sentences on the week, from the Highlights and the plan's `done`, citing nothing new. With nothing new: `Nothing new in your notes this week.`

```text
Harbor's launch moved to March and Quarry's budget grew to 18k; Conference talk proposal has no next step.
```

### Highlights (`highlights`)

One bullet for each change of `changes` with `bullet: true`, at most 6, grouped by label in this order: `Decided:` (`decided`), `Changed:` (`changed`), `Open:` (`open`), `Answered:` (`answered`), `Next:` (`next`); within a label, newest first. Each bullet is one line:

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

### Focus first (`focus_first`)

From the plan's `task_analysis`: its `order` (up to 3 subjects, in the assistant's rank, each with `title`, `url` and `evidence`), over the open work problems (overdue, stalled, blocked, no next step).

```text
1. Send the Quarry estimate: the client meeting on Thursday depends on it.
2. Get the tiler's quote: it has waited on Sam since 20 Oct.
3. Conference talk proposal: no next step since 30 Oct.
```

- One numbered line per `order` subject, 1 to 3: `<title>: <reason>`. A task's title links its `url`. Write the reason from evidence this run read: a due date, a meeting that depends on it, a decision. Don't estimate anyone's time or capacity. With no reason you can support, the line keeps the subject and its `evidence` text.
- With no subject: the one line `- No overdue, stalled or blocked work.`
- These lines change nothing: no priority, date or status. A task's own date, status or Won't Do is set on the task in Notion.

### Shorter, when `record` says it is too long

Shorten your own lines and run `record` again: fewer words in In short, in each Highlight and in each reason of Focus first. Keep every Highlight: a change marked `bullet: true` that you drop would be neither shown nor counted. Never touch an item: `record` renders them.
