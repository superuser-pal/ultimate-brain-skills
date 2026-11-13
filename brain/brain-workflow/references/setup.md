# Setup: connect a folder's work to Notion

spec/connected-workflows.md §2–§4. Ask only for what you can't find, and ask it in one message.

## 1. Find what you can

1. **The working folder:** the current folder unless the user names another. Note whether it is a Git repo, and whether it is a linked repo: `brain status` lists `repos`; a folder whose path is a `repos` entry's `path` is that repo, and its name goes in `folder.repo`. When the folder is not the brain and has no `.brain` file, or its `.brain` (JSON, a plain file read) has a `skills.names` list without `brain-workflow`, the summary in section 3 also offers to install the brain skills there.
2. **The brain:** `brain status`. Exit 3 means no brain resolves: stop and say so (set `BRAIN_DIR` or run from the brain). Note `modules` and `notion.tasks_database`.
3. **The destination:** one existing Project **or** Area, never both. Search `brain index --json` (titles and aliases) for close matches to the folder's name, the repo's kit `placement` (a kit-linked repo's `project`, else its `area`) and what the user said; list the best few, each with where it sits (its Area, and the Area's Domain, from the "Your structure" section of the brain's AGENTS.md), so two similar names can be told apart. Create a new Project or Area only when the user asks: `brain note new` through the normal path, then publish it (brain-sync) so it has a Notion page.
4. **Relations** (optional): a Goal (with a Project destination), People, Orgs. Only ids the brain has.
5. **Work type, logging level, Log artifacts:** read the destination's page through the MCP. Its properties **Workflow**, **Work type**, **Logging level** and **Log artifacts** (labels matched case-insensitively):

   | Notion | Record |
   |---|---|
   | Work type: Software / General | `software` / `general` |
   | Logging level: Tasks only / Tasks + final outputs / Full durable record / Custom | `tasks_only` / `tasks_and_finals` / `full` / `custom` |
   | Log artifacts: Briefs, Plans, Specifications, Decisions, Final deliverables | `brief`, `plan`, `specification`, `decision`, `final` (read only with Custom) |

   An empty Work type is asked (a Git repo with code suggests Software). An empty level suggests **Tasks + final outputs**. Say what each level publishes:
   - Tasks only: the tasks, and links to deliverables kept elsewhere;
   - Tasks + final outputs: the tasks, and final deliverables once approved;
   - Full durable record: the tasks, and approved briefs, plans, specifications, decisions and finals;
   - Custom: the tasks, and the approved categories chosen.

   Drafts and logs are never published unless the user asks for one.
6. **The status mapping:** each of the six meanings to an **existing** option of the Tasks database's Status property. Read the options through the MCP. For the default Tasks database (To Do, Doing, Waiting On, Done, Won't Do) it is:

   ```json
   { "todo": "To Do", "in_progress": "Doing", "waiting": "Waiting On", "review": "Doing", "done": "Done", "dropped": "Won't Do" }
   ```

   For any other database, propose a mapping from its options and ask once. Map every other existing option to a meaning in `status_read` (for example `{ "Someday": "todo" }`). Never add an option.

## 2. Modules, once per workflow

A connected workflow needs:
- **the Tasks module** (`brain status` `modules.tasks`), with a Brain ID property mapped (a non-empty `notion.tasks.properties.brain_id` in the brain's `brain.json`, read as a file): the Brain ID is how a retry finds a task it already created, so nothing is created twice. Without it, setup can't continue: offer `brain modules on tasks` (its steps are in `notion/modules/tasks.md`), and for a missing Brain ID property explain that it is a structural change the user adds by hand in Notion (decision 0022), then map it.
- **the Documents module**, for any level above Tasks only. If it is off, explain that published plans and deliverables are Documents, and offer `brain modules on documents`. If the user declines, hold the level to Tasks only and say so.

Offer each missing module once; record it in `modules_offered` (`["documents"]`), so it isn't offered again. Never turn a module on without the user's yes.

## 3. One summary, one yes

```
Connect this work to Notion?
- Folder: acme-site (general work, not a repo)
- Destination: Project "Acme website" (area Clients)
- Logging: Tasks + final outputs: the tasks, and final deliverables once you approve them
- Statuses: To Do · Doing (in progress and ready for approval) · Waiting On · Done · Won't Do
- From now on Notion owns these tasks' status; the brain keeps the scope, criteria and progress.
```

When step 1 found the folder without the brain skills, the same message asks a second question: "Install the brain skills in this folder too, so a session started here finds them? `brain link` adds `.brain`, a block in AGENTS.md, and the brain-query, brain-workflow and brain-workflow-adopt skills." It is asked only here, in setup.

On yes, in this order:
1. **Notion:** set on the destination page `Workflow` = Connected, and the Work type, Logging level and Log artifacts chosen. Read the page back.
2. **The record:** `brain workflow new --input <file>` with:

   ```json
   {
     "folder_path": "/abs/path/to/acme-site",
     "opted_in": { "statement": "Connect the Acme site relaunch to Notion" },
     "folder": { "repo": "acme-site" },
     "destination": { "project": "prj-9x4t1b7e" },
     "relations": { "goal": "gol-4h8n2m6c", "people": ["per-3h8w2n6c"] },
     "settings": { "work_type": "general", "logging": "tasks_and_finals", "custom": [] },
     "status_map": { "todo": "To Do", "in_progress": "Doing", "waiting": "Waiting On", "review": "Doing", "done": "Done", "dropped": "Won't Do" },
     "status_read": {},
     "modules_offered": ["documents"]
   }
   ```

   `folder` only for a linked repo; `relations` only when there are some; `destination` is `{ "area": "area-…" }` for an Area. `opted_in.statement` is the user's yes in a short sentence. The command writes the record, commits it in the brain, and writes `.brain-workflow.json` in the folder. Tell the user to commit that pointer with the project, like any project file.

3. **The brain skills,** only when the user also said yes to installing them: `brain link <folder> --project <id>` (or `--area <id>`, the destination). Pass on its warnings in a few words, name the skills it installed (`data.skills.names`, which may differ from the three named in the question), and, when the folder is a Git repo, tell the user to commit what it wrote. On no, write nothing. If it fails, say why, and that the workflow itself is connected.

If step 2 fails after step 1, the destination says Connected but no record exists: the next setup finds the Connected setting, fills only the gaps, and runs `workflow new` again.

**Refusals:**
- `DESTINATION_TAKEN`: that Project or Area, or that linked repo, already has an open workflow. One tracker per project: show it (`brain workflow find --destination <id>`) and continue there instead.
- `POINTER_EXISTS`: this folder already has an open workflow; run it (SKILL.md section 4).
- `MODULE_OFF`, `BRAIN_CONFIG_INVALID`: section 2.
- `UNKNOWN_ID`: a destination, relation or repo that isn't in the brain.

After setup, the first run (SKILL.md section 4) publishes the tasks as the user agrees on them.
