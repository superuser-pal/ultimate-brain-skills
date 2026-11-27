# Work in a Factory

spec/connected-workflows.md §3.5, §8.4, §15 (decision 0113). A **Factory** is a working folder with a row in Notion's Factories database: a linked repo, or any other folder connected to the brain. What the user wants next there is a Task whose **Factory** relation names it, written by hand. The folder's detailed plan stays in the folder: no plan item becomes a task, and no plan item's status is synced, either way. The CLI refuses both.

Everything in SKILL.md section 4 holds in a Factory, with these differences. The overview is in overview.md, and notion.md has the snapshot and the operations. A skill named here that this folder doesn't have (brain-connect-notion, brain-sync) is read in the brain's own `.agents/skills/` (every command's reply gives the brain's path, `brain`).

## A session

**Start**
1. Read the row first: its **Workflow** decides between this and step 4. Connected: read the Factory's tasks through the MCP, and run `brain workflow reconcile <wf> --input <snapshot> --start` (notion.md). Ask the Needs you batch and run `ops`, as in any run. `open_tasks` in the reply is the list to choose from, in its order: Doing first, then To Do. A plain task, one nobody has taken, is the user's: change nothing on it.
2. **No request from the user:** list `open_tasks` by title, each with who has it when it is claimed or `elsewhere` ("taken from another clone of the brain"), and ask which one, **before you plan anything**. With none open, say so and ask what to do.
3. **A direct request** ("make the login faster"): compare it with `open_tasks`, and stop only if one might be it: "This looks like your task *Speed up login*. Is it that one?" Name several in the one question. A yes: that task. A no, or no match: do the request.
4. **Paused** (Workflow is Standard or empty on the row, or the row is archived): say once that this Factory is paused and how to resume (**Workflow: Connected** on its row). When the record still says `connected`, `echo '{ "state": "paused" }' | brain workflow set <wf> --rev <n> --input -`. Read and change no task, reconcile nothing, write no overview, and work from the user's request.

**A task of the user's**
5. **Agree how, in the session.** Propose how you would do it: its scope, and the points that make it done. Build only after the user's yes to exactly that. A yes that asks for a change is not the agreement: show the changed how and ask again. The agreement is the user's, here in the session; Notion gets no step for it.
6. **Take it,** in one command, then claim it (SKILL.md step 4). Say it is saved only after both returned:

   ```json
   { "title": "Speed up login", "scope": "Cache the session lookup; no change to the login page.",
     "acceptance": [ { "text": "login under 300 ms at the 95th percentile", "met_at": null, "evidence": null } ],
     "approve": true, "status": "in_progress",
     "task": { "page": "<task page id>", "title": "Speed up login", "status": "To Do", "brain_id": null } }
   ```

   `brain workflow item put <wf> --input <file>`, with no `id` and no `--rev`. `task` is the task as you just read it from Notion, and `title` is its title, unchanged. `TASK_TAKEN`: tell the user who holds it (`holder`; with `item: null`, it was taken from another clone of the brain), and ask for another. Then reconcile again (no `--start`) and run its `ops`: they send the Brain ID and Doing. The overview waits for the close (step 12). A task you discussed and didn't agree on stays plain: write nothing.
7. **A task with an item already** (`item` in `open_tasks`): claim it, show its saved scope and points, and go on from them, or agree a changed how, recorded with `item put` and `"approve": true`.

**A request with no task**
8. Do it, the folder's way. Make no record and no task before the close.

**The close** (the end of the work, or the user says so)
9. **Work that had no task:** offer a task for it, with the title it would have, so the Factory shows it. On a yes, one `item put` (no `id`) with `"approve": true`, and with `"status": "done"` and `"accepted": { "statement": "<their words>" }` when the user accepts it as done, else its own status; its Notion task comes from the next reconcile's `create_task`. On a no, pass it to the overview (`done`, or `building_now`).
10. **Follow-up work you found:** offer it in one question, each with its title. On a yes, `brain sync tasks --direct --input <file>` with `{ "items": [ { "title": "…", "factory": "<fac id>" } ] }`, leaving out any title an open task of the Factory already has, then create each returned page through the MCP in its `database_id` with its `properties` (leave out `pending_relations`). A plain To Do task: nothing is recorded, no `sync record`. With Tasks' Factory property unmapped (`INPUT_INVALID`), say so and list the titles in the report.
11. **Statuses** of the tasks this session took: through their items and operations only. Done only when the user accepts it, or its PR is merged and every point is met. Never past the user's value: Done set in Notion wins with no question, and is recorded as their acceptance.
12. Release the claims of items you stop working on, reconcile again, run the `ops`, then write **the overview** (overview.md), once per session and only here, after the offers and the statuses, and report (SKILL.md section 6), naming the Needs you and what isn't in Notion yet.

**Notion unreachable:** say so, and work from the user's request, or from a taken task's saved record when the user names it. Write records only: no task listed or taken, none created, no overview. The next run reconciles.

**Factories turned off** (`MODULE_OFF` from reconcile): say once that Factories is off in this brain, and work locally as when paused. Turning it on again resumes it.

## Connect a folder

Nothing connects by itself. Linking a repo offers it, in the link's own message (brain-repos); asking to connect any other folder ("connect this work to Notion") offers it here, once. Read `modules.factories` in `brain status`, and `asked` on the `factories` item of `brain modules`:

| Factories | What to ask |
|---|---|
| on | The connection alone, not numbered, answered yes or no |
| off, `asked` false | The message below, two parts |
| off, `asked` true | Don't mention Factories unless the user does: setup.md, with a Project or an Area |

```text
1. Turn on Factories in Notion: each connected folder gets a row with your tasks for it and an overview of what is being built.
2. Connect workshop-kit as a Factory in the Area Training: sessions here start from the tasks you write for it. Level: Tasks only. Work type: General. Statuses: To Do, Doing, Waiting On, Done, Won't Do. Plan: PLAN.md. It writes .brain-workflow.json, .brain, a block in AGENTS.md and the brain skills here.
Answer: all / 1 / no
```

A "no" records it with `brain modules off factories` (commit it: `modules: factories off`), and setup goes on with a Project or an Area (setup.md). **The brain's own folder is never a Factory.**

**Find, or ask in the same message:** the Area and, if it serves any, the Projects (a linked repo's come from its kit: never ask them); for a plain folder its **plan files**, the files that say what the plan is and hold its checklist, named by the user or confirmed from what the folder has (no other file there is read for the overview); the work type (`software` for a Git working tree, else `general`); the status mapping (setup.md, step 1.6); the level, **Tasks only** suggested, the other three available. Work type and level are kept in the workflow's record, not on the row.

**It needs** what setup.md section 2 says, plus the Factories module and `notion.tasks.properties.factory`. Part 1 of the message is `brain modules on factories`, the Notion steps of `<product.path>/notion/modules/factories.md` and the rows' publish, as brain-connect-notion's "The Factories module" says. On a Tasks database the user mapped, the Factory property may be missing: ask "Add a Factory property to your tasks database?" (the user adds the relation by hand, or you through the MCP after the yes), then `brain config set notion.tasks.properties.factory '"Factory"'`. A no leaves the row and its overview, and no work can be connected to it.

**On the yes, in this order.** Commit what each step writes in the brain before the next one (`workflow` commands refuse a dirty tree). A step that fails stops the rest; the next setup finds what exists (the entry in `factory list` by its folder, the row by its Brain ID, the pointer) and does only what is missing.
1. For a folder that isn't a linked repo: `brain factory add --path <path> --name <name> --area <area id>`, with `--project <id>` and `--plan <file>` for each. `FACTORY_EXISTS` names the Factory that has the folder: go on with that one.
2. **Its row:** look its Brain ID up in the Factories database (the trash too), then `brain sync render --ids <fac>`, the MCP (with the default template: brain-sync's references/writes.md), `brain sync record`.
3. On the row, set `Workflow` = Connected through the MCP, and read it back.
4. `brain workflow new`, as setup.md section 3 says, with `"destination": { "factory": "<fac id>" }`; for a linked repo also `"folder": { "repo": "<name>" }`.
5. `brain link <folder> --area <area>` (`--repo-name <name>` for a linked repo; `--project <id>` only when it has exactly one). It writes the link back with the Factory paragraph. Tell the user to commit what it wrote when the folder is a Git repo. Failing alone, it leaves a connected Factory without the paragraph: say so.
6. Its first overview (overview.md).

**Refusals:** `DESTINATION_TAKEN` (this Factory has an open workflow: continue there), `INPUT_INVALID` at `/folder_path` (not the Factory's folder), `MODULE_OFF` and `BRAIN_CONFIG_INVALID` (what it needs, above).

**In Codex,** the sandbox may refuse writes outside the working folder, and the brain is outside it: the user approves the command, or runs Codex with full access (a writable root keeps its `.git` read-only, so the brain's commits still fail). A refused write is reported as not saved, never as done.

## Move an existing workflow to its Factory

A workflow already on a Project or an Area stays there when its folder gets a Factory, with the row's Workflow empty. It moves only when the user asks ("move acme-api's work to its Factory"), after showing what changes. On the yes:
1. `echo '{ "destination": { "factory": "<fac id>" } }' | brain workflow set <wf> --rev <n> --input -`. Items, artifacts and operations keep their ids.
2. In Notion: on each item's task page, set the Factory relation and, only while it is empty, the Area, from `brain workflow render <wf> --item <wi>`'s `properties`, leaving its Project; set the row's `Workflow` to Connected and the old destination's to Standard; remove the **Workflow** toggle from the old destination's page.
3. The first overview, then `brain link` again (step 5 above) for the paragraph.

Nothing moves back: a move to a Project or an Area is refused.

## Change a setting, pause, end

- **Work type, level, Log artifacts:** the user says so in a session ("log the plans too"). Show the change, then `workflow set` with `{ "settings": { "logging": "full" } }`. Future work only.
- **Pause or resume:** the user's, with Workflow on the row.
- **End** (SKILL.md section 5's steps and yes): the row's `Workflow` is set to Standard. A linked repo's row stays, because its folder is still linked. A plain folder's row is archived by the same command: publish it (`brain sync render --ids <fac>`, MCP, `brain sync record`), and say that its tasks and last overview stay. The folder's paragraph goes with `brain link <folder>` run again, when the user wants it.
