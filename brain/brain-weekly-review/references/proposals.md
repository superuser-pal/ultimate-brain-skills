# The proposals of step 8

For each item of `select`'s `items` whose `write` is true, in item order, write its proposal with `brain proposal new --input <base>.proposal.json`, the file holding `{ "proposals": [ … ] }`. Every proposal stays `pending`: never `brain apply` it, never decide it. Keep `{ "key": <item key>, "proposal": <id> }` for `record`. Items with `write` false need nothing: an item that links an existing proposal already has its `proposal`. That includes a **carried** item (`because: carried`, with `carried_from`, the week of the row it came from): its pending proposal moves to this week's row as it is.

`record` then sets `weekly` (the week of the row) on each `A` and `C` item's proposal, so the session doesn't ask it: the user decides it by its tick (decision 0110 §4). Don't set `weekly` yourself.

Every proposal's `source` that names the run is `agent:brain-weekly-review/<run id>` (the run id is `as_of` in compact form, `20261109T070012Z`).

## An item with `proposal_input`

When `select` hands an item over with `proposal_input`, write it exactly as given: `{ "proposals": <proposal_input> }`, never changed. That is:
- **a next step** (an `A` item from `judged.next_steps`): its `new_task`, with your `task_title` and `why`, the project as `target`;
- **a mechanical item offered to tick** (a `C` item while `settings.cleanup.auto` is off): its `merge`, `archive_draft` or `fix_structure`, with its `tidy` and `fingerprint`;
- **a correction group** (a `T` item): its `review_notes` and changes. Its proposal is the created item whose `kind` is `review_notes`.

## The other items, by stream

**`work`: an assistant finding** (an `A` item such as a project to set On Hold or Done, a `C` item such as a misplaced project). The item's `recommendation` (`action`, `value`, `label`) is the change to propose; the finding itself is the plan's `findings` entry with the item's `key` (its `subject`, `area` and `evidence`). Write it as ultimate-assistant references/answers.md writes a change (its table of actions, and step 1 of "A yes": the fields of a `notion_change`, a `set_field` or a `merge`), with these values:
- `finding` = the item's `key`; `source` = `agent:brain-weekly-review/<run id>`;
- `why` = the finding's evidence in a few words, as the plan's `task_analysis` writes it for that key when it lists it (`nothing done or mentioned for 35 days (last: meeting Pinecrest kickoff, 10 Oct)`), else one line from its `evidence`;
- `value_after` = the recommendation's `value`; `value_before`, `page` and `page_title` from the finding's `subject` (`current`, `page_id`, `title`);
- `passages` on a `set_field` or a `merge` = `["agent:brain-weekly-review/<run id>"]`; none on a `notion_change`.

```json
{ "proposals": [ { "kind": "notion_change", "finding": "project_stalled:prj-9x4t1b7e", "source": "agent:brain-weekly-review/20261109T070012Z", "why": "nothing done or mentioned for 40 days (last: meeting Pinecrest kickoff, 30 Sep)", "area": "area-2m7c4h8n", "database": "projects", "target": "prj-9x4t1b7e", "page": "7c6b5a49-3827-4615-a4b3-c2d1e0f9a8b7", "page_title": "Pinecrest signage", "property": "status", "value_before": "Active", "value_after": "On Hold" } ] }
```

A move or a merge writes only its own proposal: the tasks that would follow it are moved when the user's tick is applied, never by this run.

**`knowledge`: a reflection finding.** Write the proposal you kept for it in the run record (judging.md), with its `fingerprint` and `evidence`, as brain-reflect references/answers.md writes a "later": step 1 of "A yes" and no decision. A stale fact (`update_fact`), a promotion (`add_to_note`, the whole text it adds) and a near duplicate (`merge`, its `source` `agent:brain-weekly-review/<run id>`) are `C` items. A contradiction is the `contradiction` kind, keeping both claims, never a value of your choosing: a `T` item, decided in the session.

**A theme** (an `A` item, "Draft a Document on <term>") writes **no note now**: its proposal is one pending `new_item` holding the draft, which a tick writes as a `draft` Document with its own `review_notes` for the session (decision 0076 §4 as amended by 0110). So no `brain id new` and no `brain note new`: write the Document answers.md's "A yes" would draft (its step 2) as the proposal's `note`, without an id, in the shape of its "A skip" but with the whole body and no decision: `{ "kind": "new_item", "title": "Theme: <term>", "note": { "type": "reference", "title": "<Term>", "frontmatter": { "origin": "learned", "summary": "…", "sources": [ … ], "area"?, "projects"? }, "body": "<the brain's explanation, each statement ending with its input's title and date>" }, "why": "<term> comes up in <n> meetings and sources, and no note has it", "source": <the newest input of the cluster's evidence>, "passages": [<the passages of the input lines its statements draw from>], "fingerprint": "theme:<slug>", "evidence": [<every evidence id>] }`. The whole draft is in the proposal, so the row's Show the change shows it in full.

## What `proposal new` may answer

- **Created:** keep the id (`created[…].id`).
- **Skipped `DUPLICATE_PENDING`:** the change is already waiting (in this week's row, an earlier row it was carried from, or the session); keep the `existing` id it names. That is how a rerun in the same week keeps its items and their labels without writing them twice.
- **Skipped for any other reason** (`NO_CHANGE`, `ALREADY_LINKED`, `SOURCE_EXCLUDED`): the finding no longer holds. A knowledge finding: take it out of `judged.findings` (its cluster stays in `judged.clusters`) and run `select` again, then write the proposals of the new list (the ones already written answer `DUPLICATE_PENDING`). A next step: take it out of `judged.next_steps` and run `select` again. A work, mechanical or correction item: the run can't go on to `record`; stop, and log the failure (SKILL.md step 9, "A failure alone", with `failures="<item kind>: <reason>"`).
- **Refused** (exit 2 or 4): an input you wrote: fix it from the pointer and write it again. A `proposal_input` refused as given is a bug: stop, log the failure, and report it.
