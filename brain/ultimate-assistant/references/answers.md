# The user's answers: yes, a value, propose

How step 7 carries out an answer to a numbered finding. Each finding from `brain assistant findings` carries `key`, `subject`, `project`, `area`, `evidence`, lettered `recommendations` (`{ letter, action, value, label }`) and `status_offers`.

## Reading the answer

- **"yes 1"** is finding 1's recommendation `a`; **"yes 2b"** its `b`; **"yes 1, 3"** each one's `a`. **"yes to all"** is every recommendation `a` of the last report; **"all but 3"** all of them except 3. Archives and merges are included, with no second question: each line already named its change. Nothing is applied for a finding the user didn't name.
- **Two letters of one finding** in one answer ("yes 1a, 1b"): ask which, and apply nothing for that finding until you know.
- **A finding with no recommendation** (its line says "no change I can make here"): "yes N" applies nothing; say so.
- **A value is needed** when the recommendation's `value` is `null` (a new due date, a project, a Domain) and for every `add_task` (its value names only the project, so the next step's words are always asked). "yes 1" on it makes you ask for that value, and nothing is applied until the user gives it. "yes to all" asks first for every value it needs, one finding at a time in number order, then applies everything.
- **A value the user states** ("1: due Friday", "4: put it in Acme website") goes into the proposal you write (`value_after` for a `notion_change`, `after` for a `set_field`), which is then approved. A relative date counts from the machine's local date when the user answers and becomes `YYYY-MM-DD`; names become ids by title and alias (`brain query --candidates "<name>" --types project,area`); when it is ambiguous (two notes match, "next week"), ask and apply nothing for that finding.
- **A status offer picked directly** ("3: mark it Waiting On") is that `set_task_status` or `set_project_status`.
- **A change that isn't offered** ("3: rename it Acme site") is applied when the actions table below has an action for it. Otherwise say you can't do that here and name what can: a rename is the user's own edit in Notion, or a correction through brain-sync.
- **"propose N"** (or "propose it", "later" on a finding) writes recommendation `a` as a Review row instead; **"propose Nb"** its `b`. A `null` value is asked first, as for a yes. An `add_task` can't be a Review row: say so and offer an Inbox capture instead (ramble.md).
- **Order.** The changes of one answer are made in the order of their numbers, each finished before the next. Each proposal carries the value read in the snapshot, so a change an earlier one made stale (a merge, then a yes on one of the duplicate's tasks) settles `stale`, and you say so.

After each change, confirm it in one line, quoting values as written: `1: due date moved to 13 Nov`, `2: Status set to On Hold`, `8: moved to Marketing, with its 1 open task`, `9: merged into Quayside Books catalogue, with its 1 open task`, `5: proposed; it's in Review now.` Add the subjects it touched to the session record.

## The actions

| Action | What changes | Owner | Proposal |
|---|---|---|---|
| `set_task_status` | the task's Status | Notion | `notion_change`, `database: tasks`, `property: status` |
| `set_task_due` | the task's Due | Notion | `notion_change`, `tasks`, `due` |
| `set_task_project` | the task's Project relation | Notion | `notion_change`, `tasks`, `project` |
| `set_task_area` | the task's Area relation | Notion | `notion_change`, `tasks`, `area` |
| `set_project_status` | Projects · Status | Notion | `notion_change`, `projects`, `status` |
| `archive_area` | Areas · Archived | Notion | `notion_change`, `areas`, `archived` |
| `move_project` | the project's `area` | brain | `set_field`, `field: area` |
| `set_area_domain` | the Area's `domain` | brain | `set_field`, `field: domain` |
| `move_note` | the `area` of a decision, question, Document or source | brain | `set_field`, `field: area`, one per note ("Moving notes to another Area" below) |
| `merge_projects` | the duplicate folded into the survivor | brain | `merge`: `target` = `value.target` (the duplicate), `merge_into` = `value.merge_into` (the survivor) |
| `add_task` | a new Task | Notion | none: placed like a ramble's task (ramble.md), with the project of `value.project` |

## A yes: apply it now

For each change, in this order, before the next one:

1. **Write the proposal:** `brain proposal new --input` with `{ "proposals": [ { "kind": "<kind>", … } ] }`, one item:
   - every kind: `finding` = the finding's `key`, `source` = `agent:ultimate-assistant/<session id>`, `why` = the finding's evidence text as the report printed it, without the subject before it (`nothing active`, not `Workshops (area) · nothing active`);
   - `notion_change`: `database`, `page` (the task's `subject.page_id`, or the note's page for a project or an Area, snapshot.md), `page_title` (the snapshot's title), `property`, `value_before` (the snapshot's value), `value_after`, `area` = the finding's `area` (left out when `null`), and `target` = the project or Area id on `projects` and `areas` (none on `tasks`);
   - `set_field`: `target`, `field`, `after`, `area` = the finding's `area` (left out when `null`), and `passages` = `["agent:ultimate-assistant/<session id>"]`: it rests on the session's reading of Notion and the user's yes, no input of the brain (spec/eligibility.md §9.1);
   - `merge`: `target`, `merge_into`, `title` = the recommendation's label with a capital (`Merge Quayside catalog into Quayside catalogue`), `passages` as for `set_field`; no `area`.
   - A `notion_change` takes no `passages` (the CLI refuses them).

   Skipped `NO_CHANGE`: it is already so; say it is already done. Skipped `DUPLICATE_PENDING`: see "A yes to a change already proposed".
2. **Decide it:** `brain apply --input` with `{ "decisions": [ { "proposal": "<prp id>", "action": "approve", "decided_at": "<now, ISO 8601 UTC>", "decided_by": "chat" } ] }`.
3. **Carry it out:**
   - **Notion-owned** (`notion_change`): the apply's item result is `awaiting_notion` and `data.notion_writes` holds its write. Carry it out and settle it as brain-apply's "Notion writes" says; commit. Its confirmation lines start with the finding's number: `3: not changed: it changed in Notion since I read it. Say "review again" to see it as it is now.`, `3: not changed: the page or its Status is gone from Notion.`, or for a failed write `3: couldn't be written to Notion; it stays approved and I'll write it next session.`
   - **Brain-owned** (`set_field`, `merge`): `brain index`, `brain views`, `brain lint`, then commit the apply's `changed` paths with the index and views (`assistant: <proposal title>`). Then publish: `brain sync render --ids <every note the apply changed>`, write the payloads through the MCP as brain-sync's Push steps 10 and 11 say, `brain sync record`, commit (`publish: <proposal title>`). The yes covers this publish: `settings.publish: ask` isn't asked again.

A proposal decided in chat before it had a Review row never gets one: it is the Git record of the yes.

**A move takes the project's tasks with it.** After a `move_project` is applied and published, the project's open tasks whose `areas` holds the old Area's page are moved too, under the same yes (the label said so): one `notion_change` per task (`tasks`, `area`, `value_after` = its `areas` with the old Area's page replaced by the new one, deduplicated and sorted), written in one `proposal new`, approved in one `apply`, then written and settled. These task proposals have no `finding`, take the `area` of the finding they come with, and have `why` = the move's label (`move it to Marketing (and its 1 open task that names Clients)`). A task that names no Area follows the project and needs nothing.

**A merge takes the duplicate's tasks with it.** After a `merge_projects` is applied and published, each open task of the duplicate gets one `notion_change` (`tasks`, `project`, `value_after` = its `projects` with the duplicate's page replaced by the survivor's, deduplicated and sorted), written, approved, carried out and settled the same way, with no `finding`, the finding's `area`, and `why` = the merge's label.

A task move whose new page doesn't exist yet (a survivor or an Area never published) is left out; say so in the confirmation. A task whose write fails or settles `stale` is named in the confirmation line; the move or merge itself stands.

**Relation values.** `set_task_project` and `set_task_area` set the relation to exactly `value_after`. For a `task_no_project` finding, build it from the finding: `subject.current.projects`, minus the closed pages in `evidence.projects`, plus the chosen project's page, deduplicated and sorted (a page with neither a note nor a Projects row isn't closed, so it stays). A user's "also put it in Y" is the current list plus Y's page.

**A yes to a change already proposed.** When step 1 is skipped `DUPLICATE_PENDING` (the user said "propose 5" earlier, and now "yes 5"), use the `existing` proposal it names (read it with `brain proposal list --status pending,approved,edited`):
- still `pending`: step 2 decides it, with `approve`, or with `fix`, `fixes: [ { "value": <the user's value> } ]` and `note` = the user's words when they gave another value;
- already `approved` or `edited` (a `notion_change` waiting for its write): replay its recorded decision as session step 3 does; nothing is re-decided.

If that proposal has a Review row, step 3's publish (for a Notion-owned change, the next render) updates the row's State, so it doesn't stay Pending.

## Moving notes to another Area

The user asks for it ("move the pricing notes to Go-to-market", often right after an ingest and a new Area); no finding recommends it (decision 0092).

1. **Find the notes and the Area.** `brain query --candidates "<the words>" --types decision,question,reference,source` for the notes, `--types area` for the Area, as for any value. "The notes from the pricing memo" are the decisions, questions and Documents whose `sources` name that source, and the source itself. None or several matches for a name: ask, as for any value.
2. **Show one preview of every move,** numbered after the last number shown, one line each, then ask once:

   ```text
   18. Offer three pricing tiers (decision, draft): Product → Go-to-market
   19. Tiered pricing (Document, draft): Product → Go-to-market
   20. Pricing memo (source, with its whole Document): Product → Go-to-market
   Not moved: Should the annual discount be 15%? takes its Area from its project Pricing launch: move the project instead?
   Answer "yes to all", "yes 18, 20" or "all but 19".
   ```

   - **A source and its whole Document are one line.** Naming either moves both: the CLI moves the other with it. A `part` or `learned` Document of that source is its own line, only when the user named it.
   - **A decision or question with projects** is not listed as a move: its Area comes from its project. Name the project on a `Not moved:` line and offer `move_project` for it, which is its own yes.
   - Draft notes move like reviewed ones and stay drafts in Review.
3. **On the yes, apply them together.** One `brain proposal new` with one `set_field` per note said yes to (`target`, `field: area`, `after` = the Area, no `finding`, `why` = the user's words, `source` = `agent:ultimate-assistant/<session id>`, `passages` as for any `set_field`; no `area`: the CLI puts each row in the note's own Area). Then one `brain apply` with every decision, and the brain-owned steps of "A yes: apply it now" step 3 once for them all: `brain index`, `brain views`, `brain lint`, one commit (`assistant: move <n> notes to <Area>`), one render of every changed note, one `sync record`, one commit. Skipped `NO_CHANGE`: already there, say so. `INPUT_INVALID` naming a project: put it on the `Not moved:` line.
4. **Confirm in one line:** `Moved <n> notes to <Area>.`, then any note closed `STALE_PROPOSAL` (it changed since the preview) or refused, by name. A draft decision or question has no page yet and a decision's Area in Notion comes from its projects, so the move shows in the Area's brief and in Notion in the Area of a Document and of a source's Inbox row.

Moves the user doesn't decide in chat ("propose them") are Suggestion rows, as for any change.

## "propose N": a Review row

Write step 1 above and no decision: the proposal is `pending`. Publish it at once, since the user asked for the row: `brain sync render --ids <prp id>`, write the row through the MCP (brain-sync Push, step 10), `brain sync record`, commit (`assistant: propose <proposal title>`). The row is a **Suggestion** in Review (Kind Notion Change or Set Field, or a Merge row). The user decides it in Notion like any row: Approve, Reject, or Fix with What to fix. Whichever skill next applies the decision carries out its Notion write; until then the proposal waits as `approved`, and the next Ultimate Assistant session carries it out first (session step 3). A rejected Suggestion counts as a skip for 30 days (skips.md).

## Brain only

When the session is brain only (snapshot.md), no Notion-owned change is offered, and the findings carry none. A brain-owned change and a "propose" are still written: the proposal, the apply and their commit as above, and their publish is skipped. Confirm with `<n>: done in the brain; Notion shows it after the next sync.`, or for a Review row `<n>: proposed; the row appears in Review after the next sync.` A move or a merge is applied alone: say the tasks weren't moved. The user moves them in Notion, or in a later live session ("move Acme website's tasks to Clients"); until then each open task of a merged duplicate is a `task_no_project`.
