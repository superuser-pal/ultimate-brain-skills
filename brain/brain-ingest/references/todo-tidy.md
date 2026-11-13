# The to-do tidy (decision 0071)

Before 0.9.1 the ingest sometimes filed a to-do as an open question. This one-off step finds those questions and, **after the user's yes for each**, turns the owner's into tasks and drops the rest. Run it when the user asks ("turn my to-do questions into tasks", "clean up my open questions"), in a chat with the user. Never in a catch-up, a schedule or any unattended run. The contract is spec/capture-and-review.md §6.2; the command is `brain question drop` (spec/cli.md §5.30).

## 1. Find the candidates

Run `brain status` (the owner name, whether the Tasks module is on and Notion is configured), then take the ids of the question notes from `brain index --json` (`notes` of `type: question`, lifecycle other than `archived`: ids only, an administrative listing) and read them with `brain query --read <id>,<id>,… --json`, at most 20 ids a call. Everything below comes from what the read returned, never from a question's file: a question it withholds, or returns in its awaiting-cleanup form (`title` `null`; part of it is excluded), is not a candidate. A candidate is a question with `kind: question` (never a risk), a lifecycle other than `archived`, no `answer`, no `dropped`, and Notion Status Open or none (`notion_fields.status`). Use each one's title, summary and body, and the line of its meeting (`raised_in`) or source it came from, read the same way.

Classify each with [extraction.md](extraction.md), "Questions or commitments":
- **the owner's explicit to-do** ("Send the deck to the board?", "I'll draft the onboarding checklist") → **Convert**: a task, then the question dropped with it. With the Tasks module off, or no Tasks database, or a question with neither `raised_in` nor a non-minutes source, offer **Drop** instead and say why ("Tasks is off: it stays in the meeting's text"). The same for a question from a selected capture whose line you can't tie to one item (step 3);
- **someone else's commitment** ("Will Dana share the contract?") → **Drop**, with no task. Never a Waiting On task: only the `Track: Waiting On —` token on a meeting item makes one (decision 0055);
- anything a later document or meeting can still answer, an ambiguous owner, a tentative idea → **not listed**. When in doubt, leave it out.

Nothing found: say so in one line and stop.

## 2. Ask once

Show one numbered list, then one question:

```
3 open questions read as to-dos, not questions:
1. Convert: "Send the deck to the board?" → task "Send the deck to the board" (Acme sync, 3 Dec · Acme website)
2. Convert: "I'll draft the onboarding checklist" → task "Draft the onboarding checklist" (Ops weekly, 10 Dec)
3. Drop: "Will Dana share the contract?" (Dana's commitment: no task)
Which ones? "all", the numbers, "all but 2", or "none".
```

The task title is the action as an imperative; its projects are the question's `projects`; a `due` only when the line gives a date (extraction.md, "Tasks for the owner"). Write nothing until the user answers. An item the user doesn't name stays a question, untouched. The user may change an item ("2 is Dana's, drop it"): do what they say.

## 3. Apply, one item at a time

For each **Convert** the user said yes to, in this order:
1. `brain sync tasks --meeting <raised_in>` (or `--source <its source>` for a question from another input) with one item `{ "title", "projects", "due"? }` ([cli-inputs.md](cli-inputs.md) §4). No `item` with `--meeting`. **A source with `extract: true`** (a selected capture) needs one: take the `¶n` of the question's passage reference (`^[src-…#¶n:…]`), find the marker `<!-- passage ¶n item … -->` in that source's body as `brain query --read <src-id>` returns it, and when it names exactly **one** item, add `"item": "<that id>"`. When it names several or none, don't convert: offer Drop in step 2 instead ("I can't tell which line of the capture it came from").
2. Create the task page through the Notion MCP, as references/notion.md says for tasks.
3. `brain sync record` with the meeting's (or source's) record and `"tasks": ["<page id>"]`; for an extract source, also `"task_items": { "<item id>": "<page id>" }`.
4. `brain question drop --input` with `{ "items": [ { "id": "<que-id>", "task": "<page id>" } ] }`.

For each **Drop**: `brain question drop` with `{ "items": [ { "id": "<que-id>" } ] }` (several at once is fine).

If a step fails, stop that item and say which step failed. A task created and recorded but not dropped is safe to finish: run step 4 again (a repeated drop is `unchanged`). Never create a second task for an item whose page id is already in the meeting's `tasks` from this run.

Never delete a question, never set its Status or Lifecycle yourself, and never edit its file: `question drop` archives it, records `dropped` and the task, and the publish sends Lifecycle Archived and Status **Dropped** once.

## 4. Finish

Run `brain index`, `brain views`, `brain lint`; stop on a lint error in a file this run wrote. `brain log tidy-questions - converted=<n> dropped=<n>`, then commit in the brain repo: `tidy: <n> to-do questions converted, <n> dropped`. Publish (`brain sync render --changed` → MCP → `brain sync record`, references/notion.md), commit `publish: to-do tidy`, and push per `settings.push` (the brain's AGENTS.md, "Write path"), never off the working branch. The report then ends with the backup line (brain-setup references/backup.md, "The report's last line"): none after a push that succeeded; `<n> changes not backed up yet (Back up after each run: remind me).` with `remind`; `Not backed up: <reason>. Say "fix my backup".` when the push failed or wasn't made.

Report in three lines (SKILL.md step 12):

```
Done: 2 to-do questions turned into tasks · 1 dropped
Needs you: nothing
Next: nothing; the tasks are in Notion
```

A dropped question is never listed again, and no later re-read of its meeting turns its line into a task (extraction.md, "Re-reads").
