# The proposals of step 8

For each item of `select`'s `items` whose `write` is true, in item order, write its proposal with `brain proposal new --input <base>.proposal.json`, the file holding `{ "proposals": [ … ] }`. Every proposal stays `pending`: never `brain apply` it, never decide it. Keep `{ "key": <item key>, "proposal": <id> }` for `record`. Items with `write` false need nothing: a task item is decided on the task, and an item that links an existing row already has its `proposal`.

Every proposal's `source` that names the run is `agent:brain-weekly-review/<run id>` (the run id is `as_of` in compact form, `20261109T070012Z`).

## By stream

**`work`: an assistant finding.** The item's `recommendation` (`action`, `value`, `label`) is the change to propose; the finding itself is the plan's `findings` entry with the item's `key` (its `subject`, `area` and `evidence`). Write it as ultimate-assistant references/answers.md writes a change (its table of actions, and step 1 of "A yes": the fields of a `notion_change`, a `set_field` or a `merge`), with these values:
- `finding` = the item's `key`; `source` = `agent:brain-weekly-review/<run id>`;
- `why` = the finding's evidence in a few words, as the plan's `task_analysis` writes it for that key when it lists it (`nothing done or mentioned for 35 days (last: meeting Pinecrest kickoff, 10 Oct)`), else one line from its `evidence`;
- `value_after` = the recommendation's `value`; `value_before`, `page` and `page_title` from the finding's `subject` (`current`, `page_id`, `title`);
- `passages` on a `set_field` or a `merge` = `["agent:brain-weekly-review/<run id>"]`; none on a `notion_change`.

```json
{ "proposals": [ { "kind": "notion_change", "finding": "project_stalled:prj-9x4t1b7e", "source": "agent:brain-weekly-review/20261109T070012Z", "why": "nothing done or mentioned for 40 days (last: meeting Pinecrest kickoff, 30 Sep)", "area": "area-2m7c4h8n", "database": "projects", "target": "prj-9x4t1b7e", "page": "7c6b5a49-3827-4615-a4b3-c2d1e0f9a8b7", "page_title": "Pinecrest signage", "property": "status", "value_before": "Active", "value_after": "On Hold" } ] }
```

A move or a merge writes only its own proposal: the tasks that would follow it are moved when the user's decision is applied, never by this run.

**`knowledge`: a reflection finding.** Write the proposal you kept for it in the run record (judging.md), with its `fingerprint` and `evidence`, as brain-reflect references/answers.md writes a "later": step 1 of "A yes" and no decision. A duplicate's `source` is `agent:brain-weekly-review/<run id>`. A contradiction is the `contradiction` kind, keeping both claims: never a value of your choosing. A **theme** is a draft Document and its `review_notes`, as answers.md's "A theme" writes it for a yes or a later (`brain id new reference`, `brain note new`, then the `review_notes`); its key's proposal is the `review_notes`.

**`correction`: a claim group.** Write the item's `proposal_input` exactly as `select` gave it: `{ "proposals": <proposal_input> }`. Its proposal is the created item whose `kind` is `review_notes`.

## What `proposal new` may answer

- **Created:** keep the id (`created[…].id`).
- **Skipped `DUPLICATE_PENDING`:** the change is already waiting in Review; keep the `existing` id it names. That is how a rerun in the same week keeps its items without writing them twice.
- **Skipped for any other reason** (`NO_CHANGE`, `ALREADY_LINKED`, `SOURCE_EXCLUDED`): the finding no longer holds. A knowledge finding: take it out of `judged.findings` (its cluster stays in `judged.clusters`) and run `select` again, then write the proposals of the new list (the ones already written answer `DUPLICATE_PENDING`). A work or correction item: the run can't go on to `record`; stop, and log the failure (SKILL.md step 9, "A failure alone", with `failures="<item kind>: <reason>"`).
- **Refused** (exit 2 or 4): fix the input from the pointer and write it again.
