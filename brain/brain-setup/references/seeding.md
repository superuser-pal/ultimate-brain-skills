# Step 6: seeding

The brain starts with the user's work: their Domains (when they have more than one context), Areas, Projects, Orgs, the people they work with most, and a few key documents. The user describes it once, sees one preview, and nothing is written before their yes (decision 0078 §3). Notion is connected by now, so the seeded notes are published in one go.

Seeding goes through Ultimate Assistant's ramble (decision 0064): run the ultimate-assistant skill's `references/ramble.md`, its "Seeding" section and the rows of "Where each item goes" for each kind of note, with the preview, the source and the writes below. This file holds what setup adds: the groups and their counts, the key documents, the publish and the log line.

## 1. Describe

Ask once: "Tell me about your work in a few sentences: what you do, for whom, and with whom. Add any other part of your life you want the brain to hold (a second business, personal projects). If there is a folder or a repo with a project's plans, name it too."

- "Nothing to seed" (or the brain already holds the user's work): log `step=seeding result=done notes=0 documents=0`, commit, and go on to step 7.
- A folder or a repo: see "A folder or a repo" below; its project joins the preview.

## 2. The preview

Read the brain first (`brain index --json`) and match every item against it by title and aliases, as Ultimate Assistant's ramble does ("No second copy"): an existing note shows as `already in the brain` and is never created again, so seeding run again after an interruption duplicates nothing.

Then show one numbered list, in the ramble's form, with these groups:

- **Domains,** only when the description has **two or more contexts** (work and personal, two businesses): name and Type (`Professional`, `Entrepreneurship` or `Personal`). Say the Domains module will be turned on. With one context: no Domains, and the module stays off.
- **Areas:** name, its Domain (when there are Domains), and **What to track**: 1 to 8 short lowercase phrases for the kinds of thing worth extracting in that Area (`budget, deadlines, scope changes, risks`), proposed from the description. The user changes it like any value.
- **Projects:** name, Area, Status (`Planned`, `Active`, `On Hold` or `Done`), a one-line purpose, the client Org if any.
- **Orgs** that a project's client or a person's org names.
- **People:** the 5 to 10 the user works with most, each with Org and role, so the first meeting matches them instead of creating duplicates. Never the owner (step 5 already has them). Fewer than 5 named: ask once for more in the preview ("Who else do you work with most?"). More than 10: the first 10 the user named, and the rest offered after seeding as a later step.
- **Key documents:** ask for 3 to 5 (a brief, a plan, a contract, a proposal), which the user drops into the drop folder after the yes.

```text
Here is what I'd set up. Nothing is written until you say yes.

Domains (two contexts, so the Domains module will be turned on)
 1. Studio work · Professional
 2. Home · Personal
Areas
 3. Clients · Studio work · What to track: budget, deadlines, scope changes, risks
 4. Family · Home · What to track: school dates, appointments
Projects
 5. Harbor Lane renovation · Clients · Active · Renovate the client's kitchen and bath by spring · Client: Harbor Lane Homes
 6. Garden redesign · Family · Planned · Replant the back garden this summer
Orgs
 7. Harbor Lane Homes
People
 8. Robin Vale · Harbor Lane Homes · Site manager
 9. Jamie Ortiz · Harbor Lane Homes · Electrician
10. Kim Okafor · Harbor Lane Homes · Client contact (already in the brain)
Key documents
11. Drop 3 to 5 key documents into <drop folder> after the yes (a brief, a plan, a contract). Each becomes a Document under its Project.

You named 3 people: who else do you work with most?
Answer with "yes to all", "yes 1–7, 9", a change ("5: Status On Hold"), or "drop 6".
```

The answers work as in the ramble: "yes to all", "yes 1–7, 9", "N: <change>", "drop N". Show the preview again after each change. **Nothing is written before the yes,** not even the source note.

## 3. The writes, after the yes

1. **Domains first, when there are any:** `brain modules on domains` (the CLI refuses a Domain note while the module is off).
2. **The description is a source.** One owner-ruling source note (decision 0031, as brain-connect-notion's identities step makes), as an item of the batch below: `"type": "source"`, `"title": "Setup: my work (owner ruling)"`, `"file_date"` today (next to `title`, not in `frontmatter`), `frontmatter` `{ "source_key": "agent:<agent>/<YYYY-MM-DD>-setup-seeding", "kind": "note" }`, body = the user's description and their answers to the preview, verbatim. Every seeded note lists its `source_key` in `sources`.
3. **The notes,** as the ramble's rows write each kind, in this order so each relation names an existing id: Orgs, Domains, Areas, Projects, People. One `brain note new --input <file>` batch (`{ "notes": [ { "type", "title", "frontmatter", "body" } ] }`) holds the source and every note, since a batch may reference notes in the same batch; ids from `brain id new <type> --count <n>` go at the item's top level. Check it with `--dry-run` first.
   - Every note: `title`, `summary` (one line, in the user's words where they gave one), `sources: [<the source>]`.
   - A summary or body you word yourself follows [the writing reference](../../brain-query/references/writing.md) (decision 0081 §7).
   - Domain: `org` when the preview names one. Area: `domain` when there are Domains, and `track` with the What to track list. Project: `area` (required), `client` (an `org-` id) when given; body: the one-line purpose. Person: `org` when they have one; `facts: { "role": "<role>" }` and, beside it in `frontmatter`, `timeline: [ { "field": "role", "value": "<role>", "from": "<today>", "learned": "<today>", "source": "<the source_key>", "assessment": "accepted" } ]`.
   - Domains, Areas, Projects and Orgs are written `reviewed` by the CLI (decision 0070). People are written `draft`, like every new person: they are published as Draft, so the first meeting matches them, and the user marks them Reviewed in Notion when they like.
4. **Rebuild and commit:** `brain index`, `brain views`, `brain lint`, then one commit `setup: seed my work`.
5. **One publish** of every seeded note and the setup's source, whatever `settings.publish` says, since the preview's yes covers it: `brain sync render --ids <every seeded id and the source's>`, create each page through the MCP, `brain sync record`, and a render again for any pending relations, as the brain-sync skill's Push says, with its `publish` log line and commit. Then, under the same yes, set what Notion owns on the new pages through the MCP: each Project's Status and each Domain's Type from the preview. The next sync pulls them into the brain. **A publish that fails** (Notion unreachable, a CLI error): the notes stay in Git; log `step=seeding result=failed reason=<code>` and stop with the fix. On resume, the preview shows every item `already in the brain`, so nothing is written again: publish the seeded notes that have no page yet (`brain sync render --ids <their ids>`), then go on.
6. **Key documents** (below).
7. **Log** `step=seeding result=done notes=<seeded notes, the source not counted> documents=<Documents kept>`, commit.

## Key documents

Say: "Drop your 3 to 5 key documents into <drop folder> now, then say "done"." Then run the brain-ingest skill on the drop folder, answering **Keep as document** for each file and placing each under the Area and Project the user names (from the preview). What the user said here is the drop folder's answer: don't ask its question again. Each becomes a Document. What the brain reads from them (decisions, questions, people, tasks) goes through **Review as usual**, one row per file: the user's first Review is on their own material. Say so in one line, and wait for nothing: deciding those rows is part of step 7.

- No documents ("I'll add them later"): `documents=0`. The first-value check then has no seeded document: see first-value.md.

## A folder or a repo

A folder or repo the user points to is adopted through the brain-workflow-adopt skill (project adoption, 0.9.0), with its own preview and its own yes. Run it after the seeding writes, so its project can sit under a seeded Area. In the seeding preview it shows among the Projects as `adopted: <name>`, and it is not written a second time.
