# The assistant snapshot

What step 2 and step 4 of a session read, written as one JSON file that `brain assistant findings --input` takes. The CLI validates it and refuses a wrong shape (`INPUT_INVALID` with a pointer): fix the file, never the CLI's answer.

## Notion, live

Read through the Notion MCP, querying each database through its data source (retrieve the database, then use its `data_sources[0].id`). Read **every row**: follow `next_cursor` until it is null. Database ids: `brain config get notion.databases` (Projects, Areas) and `brain config get notion.tasks` (the Tasks database and its property mapping; the CLI reads the done, dropped and waiting status names itself).

```json
{
  "as_of": "2026-11-06T10:00:00Z",
  "notion": "live",
  "task_statuses": [
    { "name": "To Do", "group": "todo" }, { "name": "Doing", "group": "in_progress" },
    { "name": "Waiting On", "group": "todo" }, { "name": "Someday", "group": "todo" },
    { "name": "Done", "group": "complete" }, { "name": "Won't Do", "group": "complete" }
  ],
  "tasks": [
    { "page_id": "2b8c4d6e-1f3a-4b5c-8d7e-9f0a1b2c3d4e", "title": "Send the revised quote", "status": "To Do",
      "due": "2026-10-29", "projects": ["7c6b5a49-3827-4615-a4b3-c2d1e0f9a8b7"], "areas": [],
      "created": "2026-10-01T09:00:00Z", "last_edited": "2026-10-20T08:30:00Z" }
  ],
  "projects": [
    { "page_id": "7c6b5a49-3827-4615-a4b3-c2d1e0f9a8b7", "brain_id": "prj-9x4t1b7e", "title": "Acme website",
      "status": "Active", "archived": false, "last_edited": "2026-10-28T16:00:00Z" }
  ],
  "areas": [
    { "page_id": "5d4c3b2a-1908-4f7e-8d6c-5b4a39281706", "brain_id": "area-2m7c4h8n", "title": "Clients", "archived": false }
  ],
  "repos": []
}
```

- **`as_of`:** the time the reads started, from the machine's clock (`date -u +%Y-%m-%dT%H:%M:%SZ`). It is the session's time: a re-read keeps it, and the days of every signal, the report's date and every proposal's `source` use it. Pass no `--now` to any command.
- **Page ids** in Notion's dashed form, lowercase, everywhere.
- **`task_statuses`:** the options of the property the Tasks mapping names for `status`, in the database's order, from the data source's schema. For a Notion Status property, each option's `group` is the group that holds it: To-do → `todo`, In progress → `in_progress`, Complete → `complete`. For a select property, `group` is `null`.
- **`tasks`:** every row of the Tasks database that isn't in Notion's trash, with values from the mapped properties: `title`; `status`, the option name (`null` when empty); `due`, the first 10 characters of the date's start (`null` when empty); `projects` and `areas`, the relations' page ids, sorted (`[]` when empty); `created` and `last_edited`, the page's `created_time` and `last_edited_time`. A property whose mapping is empty is sent as `null` (`status`, `due`) or `[]` (`projects`, `areas`).
- **`projects`, `areas`:** every row of the Projects and Areas databases: `brain_id` (Brain ID, `null` when empty), `title` (Name), `archived` (Archived); for projects also `status` (Status, `null` when empty) and `last_edited`.
- **Tasks module off** (`modules.tasks` false): leave out `tasks` and `task_statuses`, and don't read the Tasks database.
- `repos` is always present (step 4 fills it; `[]` when there is none).

Live values win over the brain's dated `notion_fields` for Status and Archived. Store nothing you read in the brain: task statuses stay in Notion, and only the next `brain sync` refreshes `notion_fields`.

**A note's page.** The findings name pages and notes. A note's page is its `notion` id, else the `page_id` of the Projects or Areas row whose Brain ID is the note's id (a page whose publish wasn't recorded yet). Wherever you turn a note into a page id (a `notion_change` on a project or an Area, a task's Project or Area relation, a merge's or a move's task moves), use the note's page; `subject.page_id` already is it when the note is the finding's subject.

## Linked repos

For each `repos` entry in `brain status`, run `brain repo tasks <name>` as the brain-repos skill's "The rollup (tracked-in-repo)", step 1 says (when `brain repo show <name>` gives a kit whose tasks come from GitHub or GitLab issues, fetch them first and pass them with `--input`), and add `{ "name": "<name>", "rollup": <its data> }`. A repo refused with `NO_KIT`, `MODE_CONNECTED` or `NO_TASKS` is left out silently: a connected repo's tasks are already Notion Tasks. One that fails (no `gh`, not logged in, any other error) is added as `{ "name": "<name>", "error": "<the reason in a few words>" }`; the report names it. The rollup is read only: this session writes nothing in a repo or on its toggle.

## Notion unreachable

When a read fails (the MCP is missing or not logged in, or any query above fails after one retry), discard every row already read, so the findings never mix live and dated values, and write:

```json
{ "as_of": "2026-11-06T10:00:00Z", "notion": "unreachable", "repos": [] }
```

with the repos of step 4 as usual. The whole session is then **brain only**: the report's second line says so, statuses come from the brain's dated `notion_fields`, the signals that need Notion aren't computed, and no change to a Notion-owned field is offered. Brain-owned changes and Review rows are still offered; their publish waits for the next run that reaches Notion (answers.md, "Brain only").
