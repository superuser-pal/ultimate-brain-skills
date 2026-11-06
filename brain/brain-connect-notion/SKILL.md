---
name: brain-connect-notion
description: Connect the brain to the user's Notion space after it was built from the notion/ prompts. Gives the agent access to Notion, finds the Brain Data page and its databases, checks each has the properties the brain reads and writes, stores their ids in brain.json, maps the Tasks database and records the owner's identities. Also lists and switches the optional modules (Domains, Knowledge, Orgs, Documents, Reports, Tasks, Planning), walking the user through a module's Notion steps when it is turned on. Changes nothing in Notion itself. Use when the user says "connect the brain to Notion", "which modules do I have?", "turn on documents", "turn planning off", after building the Notion space, when Notion is unreachable, or when a skill reports a Notion database is not configured or a module is off.
---

# Connect the brain to Notion

Find the user's Notion databases and record their ids in `brain.json` (decision 0015). This skill **only reads Notion**. It writes `brain.json` through `brain config set`, and, only in step 6 and only with the user's answer as their approval, the owner's identities: an owner-ruling source note, plus either alias proposals on the owner's person note (applied in chat) or a new person note.

Run CLI commands as `brain <command> --brain <brain> --json`. If `brain` is not found (`command not found`), install it with `npm install -g ultimate-brain`, then retry.

## Procedure

0. **Modules** (decision 0048), at the first connection, when the user hasn't chosen yet. Run `brain modules` and show the checklist, with what each module adds and its default:

   ```
   Core (always on): Inbox, Meetings, Projects, Areas, People, Review
   [x] Knowledge: Decisions, Questions
   [ ] Domains: group Areas by work or life context (its database is in every space)
   [x] Orgs: client and partner organizations
   [ ] Documents: keep a document, or part of one, as a page
   [ ] Reports: ask the brain in the Inbox, get a report in Documents you can refresh (turns Documents on too)
   [ ] Tasks: action items as Notion tasks
   [ ] Planning: Goals and Key Results
   ```

   Ask once: "Keep these, or change some? (e.g. "add documents")". Write each change with `brain modules on|off <module>`. The steps below look only for the databases of modules that are on; a database that exists for a module that is off is reported ("Goals found; Planning is off: say "turn on planning" to use it"), and its id is still stored.
1. **Check access.** The Notion connection (MCP) must reach the user's workspace. Search for the page **"Brain Data"**:
   - **No Notion tools in this session:** the agent isn't connected to Notion. Give the user the steps in "Connect your agent to Notion" below for the agent they are using, and stop.
   - **Not found:** the connection can't see the page. With the hosted Notion MCP, the user's own Notion account must have access to Brain Data; with an integration token, open Brain Data in Notion → `•••` → **Connections** → add the integration. Then stop.
   - **More than one:** ask which one.
2. **Find the databases.** List the Brain Data page's child blocks; each `child_database` has a title. Match the titles exactly:

   | Title | `brain.json` key |
   |---|---|
   | Areas | `areas` |
   | Goals | `goals` |
   | Key Results | `key_results` |
   | Projects | `projects` |
   | Meetings | `meetings` |
   | People | `people` |
   | Domains | `domains` |
   | Orgs | `orgs` |
   | Decisions | `decisions` |
   | Questions | `questions` |
   | Review | `review` |
   | Inbox (called Capture Inbox before 0.3.0) | `inbox` |
   | Documents (called References before migration 0010) | `documents` |
   | Tasks | `notion.tasks.database` (below) |

   A missing database is reported, not invented. A **Concepts** database in the space predates 0.9.1 (decision 0071): never write it in `brain.json`; name `notion/migrations/0018-concepts-become-documents.md` (run with `brain-notion-change`), which moves what it held to Documents and retires it. **Domains** is expected in every space, with the module on or off (decision 0065): when it is missing, the space predates 0.8.1, so name `notion/migrations/0014-domains-database-in-every-space.md` (run with `brain-notion-change`). A missing database of a module that is on is the module's Notion steps still to do ("Turning a module on" below); the brain works without it, and the skills that need it say so.
3. **Check each database** (read-only). Retrieve the database, then its data source (current Notion API: a database has `data_sources`, and its properties live on the data source). Check that every property in docs/notion-space-design.md §3 for that database exists with the right type: relations point to the right database, and selects have the listed options.
   - Report each difference as `Database · Property: expected …, found …`.
   - Report two select options that share an id (it has happened after adding an option through Notion AI), and suggest deleting and re-adding the option by hand.
   - **Workflow settings** (decision 0059, docs/notion-space-design.md §3.19): Projects and Areas each have **Workflow** (select: Standard, Connected), **Work type** (select: Software, General), **Logging level** (select: Tasks only, Tasks + final outputs, Full durable record, Custom) and **Log artifacts** (multi-select: Briefs, Plans, Specifications, Decisions, Final deliverables), in every space. Compare names and types exactly and option labels case-insensitively. When they are missing, the space predates 0.9.0: name `notion/migrations/0015-workflow-settings-on-projects-and-areas.md` (run with `brain-notion-change`). The brain works without them; only connecting work to Notion needs them. They are read by name, so nothing goes in `brain.json`, and this skill never reads or sets their values.
   - **Don't fix anything in Notion.** Structure changes go through the `brain-notion-change` skill (decision 0022).
4. **Store the ids.** For each database found, run `brain config set notion.databases.<key> '"<database id>"'`. Store the **database** id, not the data source id; skills resolve the data source when they query.
5. **Tasks** (decision 0018):
   - **The default Tasks database on Brain Data:** set `notion.tasks.database` to its id. The template's mapping (Name, Status, Due, Project, Area, Meeting, Source, Brain ID) already matches it; set `notion.tasks.status_type` to `"status"` with `brain config set` when it's absent or different (its Status is Notion's built-in type; a brain made before 0.3.2 has no such field), and check `notion.tasks.properties.source` is `"Source"` when the database has that relation (built from 0.3.0 on, or after migration 0005), and set it to `""` when it doesn't, so sync never writes to a missing property.
   - **The user's own tasks database:** ask which one, read its properties, and propose a mapping for `title` (required), `status`, `due`, `project`, `area`, `owner`, either `meeting` (a relation to Meetings, preferred) or `meeting_url` (a URL property), and `source` (a relation to the Inbox, optional: the backlink for the owner's tasks from documents and emails).
     - Show the mapping and get a yes before running `brain config set notion.tasks '<json>'`.
     - Ask which status means closed without doing the work (default `Won't Do`). If the user names an existing option, set `notion.tasks.wont_do_status` to that name. If none exists, leave the default mapping and explain that a dropped status can be added by hand; do not rename unrelated statuses.
     - Also set `new_task_status` to the status option new tasks should get, and `status_type` to the mapped Status property's type: `status` (Notion's built-in Status) or `select`. Always set it: absent means `select`.
   - **No tasks database:** leave `notion.tasks.database` empty. The ingest then lists action items in its report instead.
6. **Your identities** (decision 0037), when `brain.json` has no `owner.person`. Ask once: "Which names and work email addresses do you appear under in meetings, documents and emails?" (for example a nickname, a work name, two email addresses). Find the owner's person note in `brain index --json` by the owner name in `brain.json` and its aliases. Then:
   - add each name and email the note doesn't list yet as an alias, with one `add_link` proposal per value (`field: aliases`, `why` = the user's answer, `source` = an owner-ruling source as in brain-ingest references/extraction.md, "Owner rulings"); the CLI groups them into one Review row, which the user approves here in chat (brain-apply, chat mode). In a catch-up, the answer to its batch question is that approval: apply them with `decided_by: chat` without asking again;
   - run `brain config set owner.person '"<per- id>"'`.
   - No person note yet: create it with `brain note new` (a `person` with `title` = the owner name and the answer as `aliases`, citing the owner-ruling source), then set `owner.person`.
7. **Verify.** When Tasks is on and its database and status property are mapped, retrieve the mapped Tasks data source and collect the names of the mapped status or select property's options. Write a temporary JSON snapshot with `database` (the mapped database id), `property` (the mapped status property name), `as_of` (the retrieval timestamp) and `options` (the option names). Run `brain status --tasks-schema <snapshot> --json` and report its `tasks_status_note` if present. Explain that the user can add the mapped option by hand in Complete, or map an existing closed-without-doing option with `brain config set notion.tasks.wont_do_status`; the names-only snapshot cannot check its group. If Notion cannot be read, run `brain status` without a snapshot and say the option was not checked. Otherwise run `brain status`. `notion.configured` lists the keys you set, and `notion.tasks_database` is true when Tasks is set. Then run `brain lint`: its `brain-config` rule validates the whole file.
8. **Commit** in the brain repo: `connect: Notion databases`.
9. **Report:**
   - the databases connected;
   - anything missing or different from the design (step 3);
   - the modules on, and those with a database still missing;
   - what to do next: build the Notion space's missing parts, or run `brain-sync` to import the rows you already created in Notion (0021), then ingest reviewed meetings.

## Turning a module on or off

When the user asks ("turn on documents", "turn planning off", "which modules do I have?"), outside the procedure above:

1. **List:** `brain modules`. Report each module as on or off; for one that is on, its `missing` databases.
2. **Off:** `brain modules off <module>`, commit `modules: <module> off`. Say what stops: "Planning off: catch-up no longer reads Goals or Key Results. Nothing is deleted; turn it on again any time." Nothing changes in Notion; the user may hide the databases themselves.
3. **On:** `brain modules on <module>`. Then check what Notion still needs. `missing` lists only the module's empty database ids, so it can't tell whether the module's properties, relations and buttons exist (and Reports has no database at all): read the databases `notion/modules/<module>.md` touches (step 3 above) and compare them with the file's steps, through each step's Verify item.
   - **Everything there:** commit `modules: <module> on`, and say what the next catch-up does with it.
   - **Something missing** (a database, a property, a relation, a button): walk the user through `notion/modules/<module>.md` in the product repo, from its first step that isn't done, step by step: the Notion AI prompts they paste, the buttons and layouts they set by hand, then find the new database under Brain Data (step 2 above), check it (step 3) and store its id with `brain config set notion.databases.<key> '"<id>"'` (Tasks: step 5). This skill doesn't build anything in Notion itself (decision 0022). Run `brain modules` again (`missing` is empty) and the file's Verify list. Commit `modules: <module> on`.
   - **The user stops halfway:** the module stays on with a part missing; with a database id missing, its notes are skipped with `DATABASE_NOT_CONFIGURED` until the id is set, and a missing property or button means the requests it carries never arrive. Say so, and that "turn on <module>" picks up where they left off.
4. **Report** in three lines: what changed, what still needs them in Notion, and the next step.

## Connect your agent to Notion

The agent reads and writes Notion through a Notion MCP server (decision 0015). Give the user the steps for their agent; they run them in their own terminal, then restart the agent in the brain folder.

**Hosted Notion MCP (recommended).** Notion runs it; the user signs in with their Notion account, and the agent can reach what that account can.
- **Claude Code:** `claude mcp add --transport http notion https://mcp.notion.com/mcp`, then in Claude Code run `/mcp`, choose notion and sign in.
- **Codex:** add to `~/.codex/config.toml`:
  ```toml
  [mcp_servers.notion]
  url = "https://mcp.notion.com/mcp"
  ```
  then run `codex mcp login notion` and sign in.

**Integration token (access limited to Brain Data).** For users who want the agent to see only the brain's pages. Notion no longer maintains this server, so prefer the hosted one.
1. Open notion.so/profile/integrations, create an internal integration for the workspace, and copy its secret (`ntn_…`) from its Configuration tab.
2. Open **Brain Data** → `•••` → **Connections** → add the integration. Do the same for the **How it works** page if the user wants the agent to update it.
3. Add the server, with the secret in place of `ntn_…`:
   - **Claude Code:** `claude mcp add notion --env NOTION_TOKEN=ntn_… -- npx -y @notionhq/notion-mcp-server`
   - **Codex:** `codex mcp add notion --env NOTION_TOKEN=ntn_… -- npx -y @notionhq/notion-mcp-server`

The secret is a password: the user types it in their own terminal, never in the chat.

## Re-running

Re-running is safe. Ids that are already correct are left alone, and changed ids are updated (for example, after the user recreated a database). If an id changes for a database the brain has already published to, warn the user. The brain's notes keep their old page ids, and the next sync reports `NOTION_ID_MISMATCH` for them.
