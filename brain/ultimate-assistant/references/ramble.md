# A ramble lands in its place

When the user says several things at once ("the Acme quote is done, I should call Lucía about the contract by the 13th, and maybe a blog series on onboarding"), split it into items, show them as a numbered list with where each goes, and place what the user says yes to. **The yes is the review:** what the user says yes to lands directly; what they don't name is dropped. A ramble item never becomes a Review row.

## The list

The items continue the session's numbers (after the last number shown), one line each:

```text
15. The Acme quote is done: "Send the revised quote" (task) → Status Done
16. Call Lucía about the contract → Tasks, Due 13 Nov, Project Acme website
17. A blog series on onboarding → Inbox capture
Answer with "yes 15, 16", a change ("16: due Friday"), "later 17", or "yes to all".
```

The list becomes the last report: "yes N" places that item, "N: <change>" corrects it and shows it again, "later N" makes it an Inbox capture with Brain Status New, "yes to all" places every item that can be said yes to, "all but N" all of them except N.

- **Values.** Resolve dates and names as answers.md says, and show the resolved values ("Due 13 Nov", "Project Acme website") before the yes. A vague date ("next week", "soon", "later this month") shows as `Due: ?`: ask for a day or "no date" before that item can be said yes to ("no date" leaves Due empty). "yes to all" over `Due: ?` items asks each value first, in number order, then places everything.
- **Which existing thing.** Match the user's words against the snapshot's open tasks and the live projects and Areas (titles, and the brain's aliases, found with `brain query --candidates "<the words>" --types project,area`). The "Your structure" section of the brain's AGENTS.md shows which Domain each Area is in and which Area each active project is in: use it to show where an item lands and to tell two similar names apart, not as a match by itself (a paused project isn't listed there). Exactly one match shows as `"<title>" (task)`, `<title> (project)` or `<title> (area)` with the change. None or several: ask, naming up to 5 candidates, and place nothing for that item until the user picks.
- **No second copy.** Before showing a task item, look for an open task with the same title (trimmed, case-insensitive) in the snapshot and among the tasks this session created; show `already in Tasks` for it instead, with nothing to say yes to.
- **Brain only:** tasks, Waiting On tasks, captures and Notion-owned changes can't be placed. Mark them `(Notion unreachable)`, offer no yes, and keep them for the closing summary's `Not placed` line. A new project and a brain-owned change are still written in Git; their pages are published by the next brain-sync or catch-up.

## Where each item goes

| The item | Lands as | How, after the yes |
|---|---|---|
| A change to something that exists ("the quote is done", "Acme is on hold") | the matching action of answers.md's table | answers.md, "A yes: apply it now", with no `finding`: `why` = the user's words for that item, `page_title` and `value_before` from the snapshot, `area` = the subject's placement as `brain assistant findings` places a finding (spec/cli.md §5.31, the `project` and `area` of a finding): for a task, the `area` of its first live project in the brain, else of its first project in the brain, else the first brain Area its `areas` names; for a project, its `area`; for an Area, itself; left out when there is none. "First" is by title, then id. For a relation, "put it in Y" or "move it to Y" sets it to `[Y]`, "also in Y" adds Y to the snapshot's list |
| Notes to file in another Area ("move the pricing notes to Go-to-market") | the `move_note` action | answers.md, "Moving notes to another Area": its own preview of every move and one yes |
| A task the user will do ("call Lucía by the 13th") | a Task in Notion, with Project and Due when given, and Area when the user named an Area and no project | `brain sync tasks --direct --input` with `{ "items": [ { "title", "due"?, "projects"?, "area"? } ] }`, then create each returned page through the MCP in its `database_id` with its `properties`. Nothing is recorded: no `sync record`. With the Tasks module off, offer it as a capture instead |
| Someone else's commitment the user wants to track ("Ana owes me the logo files") | a Waiting On task with that person as owner | as a task, the item carrying `"status": "waiting_on"` and `"owner": "<their name as the user said it>"` |
| A new project ("start a project for the onboarding guide") | a project note and its page from the Projects template | `brain note new` with `{ "notes": [ { "type": "project", "title": "<its title>", "frontmatter": { "area": "<area id>", "summary": "<one line in the user's words>" }, "body": "" } ] }` (the CLI writes a project as `reviewed` itself; `area` is required: ask when the user didn't say), `brain index`, `brain views`, `brain lint`, commit; `brain sync render --ids <prj id>` (a `create` from the default template), the MCP as brain-sync Push step 10 says for a project `create`, `brain sync record`, commit. A Status the user gave is then a `set_project_status` under the same yes, whose `value_before` is the Status the new page has, read through the MCP once the template is applied |
| A new Domain, when the user names a second context ("my own business on the side") | a domain note and its page | the new project's steps, with `type` `domain`, `frontmatter` `{ "summary", "org"? }`, after `brain modules on domains` when the module is off (say so in the list: "turns Domains on"). Its Type (`Professional`, `Entrepreneurship` or `Personal`) is then set on the page through the MCP under the same yes |
| A new Area ("I also look after the studio's hiring") | an area note and its page | the new project's steps, with `type` `area`, `frontmatter` `{ "summary", "domain"?, "track"? }`: `domain` when the brain has Domains (ask when it isn't clear which), `track` the 1 to 8 short lowercase kinds the user wants tracked there, shown as `What to track: …` |
| A new Org a project's client or a person's org names | an org note and its page | the new project's steps, with `type` `org`, `frontmatter` `{ "summary" }` |
| A person the user works with ("Robin, the site manager at Harbor Lane") | a person note, `draft` like every new person, and its page | `brain note new` with `type` `person`, `frontmatter` `{ "summary", "org"?, "aliases"?, "facts": { "role": "<role>" }, "timeline": [ { "field": "role", "value": "<role>", "from": "<today>", "learned": "<today>", "source": "<the session's source_key>", "assessment": "accepted" } ], "sources": ["<the session's source_key>"] }`. A role needs the session's owner-ruling source (below). Published as Draft; the user marks it Reviewed in Notion when they like |
| A folder or a repo with a project's plans to adopt ("my plans are in ~/work/garden") | the project's adoption, with its own preview | the brain-workflow-adopt skill, after the other items are placed, so its project can sit under an Area just created; the list shows it as `adopted: <name>` and nothing is written for it until its own preview's yes |
| An idea, a note or anything to keep ("a blog series on onboarding") | an Inbox capture for the normal ingest | create a row through the MCP in the Inbox database (`notion.databases.inbox`): Name = a short title, Kind Capture, Brain Status Ready (New after "later"), Project and Area when named and the note has a page (otherwise the relation stays empty and the name stays in the text), body = the user's words for that item, as they said them. Nothing is written in Git: the next catch-up takes it in |

**Order.** After the yes, create the new notes first, in the order Orgs, Domains, Areas, projects, people, so each relation names an existing id and an item that names one ("call Lucía about it") can relate to its page; one `brain note new` batch may hold them all, checked with `--dry-run` first, then one render, MCP and `sync record` round for their pages. Then the other items in the list's order.

**The session's source.** A person's role, and any other fact a ramble gives a new note, rests on the user's words: before the batch, add one owner-ruling source to it (decision 0031): `"type": "source"`, a title naming the session (`Ramble: <date> (owner ruling)`), `"file_date"` today next to the title, `frontmatter` `{ "source_key": "agent:<agent>/<YYYY-MM-DD>-ramble-<session id>", "kind": "note" }`, body = the user's words for those items, verbatim. Domains, Areas, projects and Orgs with only a name and a summary need none. A page whose creation fails is named in the confirmation and not retried; the ones created before it stay. Count each task, project and capture created for the closing summary, and add each changed subject to the session record.

**The session stays open.** Placing the items, even every one of them, doesn't end the session: after the confirmations, wait for the user's next words, and close only as SKILL.md's "Close" says (the user ends it, or turns to something else).

## Seeding: setting up the user's work (brain-setup)

The brain-setup skill's step 6 runs this flow on the user's description of their work, with no review session around it: it reads no Notion snapshot and computes no findings. Everything above holds, with these differences:

- **One preview, in groups:** Domains (only with two or more contexts), Areas (with Domain and What to track), Projects (Area, Status, a one-line purpose, the client Org), Orgs, People (5 to 10, each with Org and role), then the line about key documents. Numbered from 1.
- **Matching** is against the brain only, by titles and aliases: `brain query --candidates "<the name>" --types area,project,org,person`, and for Domains, which `brain query` doesn't search, the `domain` notes of `brain index --json`. A match shows as `already in the brain` with nothing to say yes to, so a seeding run again after an interruption writes nothing twice.
- **The source** is the setup's own owner-ruling source (`Setup: my work (owner ruling)`, `agent:<agent>/<YYYY-MM-DD>-setup-seeding`), holding the description and the preview's answers verbatim. Every seeded note lists it in `sources`.
- **The publish** covers every seeded note and the setup's source in one round, whatever `settings.publish` says: the preview's yes covers it. It follows the brain-sync skill's Push (its `publish` log line and commit). Then each Project's Status and each Domain's Type are set on the new pages through the MCP under the same yes.
- **Tasks and captures** are not part of seeding: a to-do or an idea in the description is offered after seeding, as an ordinary ramble item.
- No session record, closing summary or `assistant` log line: brain-setup logs the step (`seeding`, with its counts).

