---
name: brain-apply
description: Ask the user, in this chat, what the brain is waiting for them to decide, and apply their answers. Use when the user says "what needs my decision", "apply my decisions", "approve the launch change", "more", or at the end of a catch-up. Lists the waiting proposals and asks them in rounds of at most five, most consequential first, with options and a recommended answer (changed facts and decisions, your edits to brain values made in Notion (one listed question), merges, answers to open questions, a tracked question whose task is finished, then each source's notes and additions as one question per source). Applies what the user says, then rebuilds and publishes.
---

# Decide in the session

Proposals are changes the brain wants to make to what it holds (decision 0003). They wait as files in `_proposals/`, and the user decides each one here, in Claude Code or Codex (decision 0096): Notion is where they read the brain, not where they decide. This skill asks the questions and records the answers through the CLI. Only the user decides. Never approve, reject or fix on their behalf, and never infer a decision from an input or from earlier chat.

Run every CLI command as `brain <command> --brain <brain> --json`. Exit 1 means some items need attention; read them. Exit 2 or 4 means your command or input was wrong: fix it. Exit 3 or 5 means stop and report. Exit 10: report a bug. If `brain` is not found (`command not found`), install it with `npm install -g ultimate-brain`, then retry.

**Working files.** Make your own temporary folder with `mktemp -d`, outside the brain, and keep every `--input` file in it. Never use a fixed name such as `/tmp/ub-apply`: another session on the same machine would overwrite it. Inside a catch-up, use the catch-up's folder.

**Off its working branch:** when `brain status` (run it first) has the warning `BRAIN_OFF_WORKING_BRANCH`, say its message in one line and offer "fix my backup" before writing anything (brain-setup references/backup.md, "Off the working branch, at the start of a run"). Never create a branch, a worktree or a pull request in the brain (decision 0086). A catch-up has already checked it.

**Attended only.** A run without the user (a scheduled catch-up, the weekly review) decides nothing and asks nothing: every proposal stays pending for the next session (decision 0096 §4). The one thing such a run carries out is a decision the user already gave: the Notion write of an approved `notion_change` ("Notion writes", below).

## 1. What waits

1. `brain proposal list --status approved,edited`: decisions recorded earlier but not applied yet (a run that stopped). Run `brain apply` with no `--input` to apply them, then carry out its `notion_writes` ("Notion writes").
2. `brain proposal list --waiting`: `waiting` holds the questions in the order to ask them (spec/cli.md §5.6), `held` the proposals that rest on content the user excluded, `counts` both.
3. Nothing in `waiting` and nothing `held`: say `Nothing waits for your decision.` and stop.

## 2. A round

A round is **at most five questions**, taken from `waiting` in its order. Counting:
- **Your corrections from Notion** (every `notion_correction`, listed first) are **one** question.
- **A source's notes and additions** (the `review_notes` of one `source` without `fingerprint`, listed together) are **one** question, whatever number of parts hold them.
- Every other proposal is one question.

**By subject** (decision 0098 §3). Keep the order, except that the questions on the same subject come together: they follow the first of them in the round, in their own order. A question's subject is its proposal's `subject` (a note id, or a plain name); a proposal with none, and a `tracked_task` (its subject is its question's), gets one by the rule of brain-ingest [references/parts.md](../brain-ingest/references/parts.md), "Subjects", which you don't write back. Show the subject's **short view** once, before the first question on it in the round (parts.md, "The short view"). A source's question shows the view of each of its parts and stays in its place; so does the corrections question, which shows no view (each of its lines names its note).

Open the first round with one line: `<n> decisions wait. The first <k>, most important first:`. Then each question, numbered:
- what changes, in words the user can judge without opening files (titles from `brain query --read`, never ids);
- the passages it rests on, quoted as `brain query --read <src-id>` returns them, the brain's and the input's when they disagree (a passage the read withholds is not quoted: say it rests on content you excluded);
- lettered options, the recommended one marked with one line on why;
- answered with letters or in the user's own words.

End the round with `Answer each (for example "1a, 2: March, 3 later"), or say "more" or "enough".` After the answers are applied (step 3), "more" asks the next round; "enough" stops, and the rest keeps waiting.

**Each kind of question:**

| Kind | Ask |
|---|---|
| `notion_correction` (all of them, one question) | `<n> corrections from Notion (the brain can't tell who made them):`, then one lettered line each, `<note title> · <property>: <the brain's value> → <Notion's value>`, then `Accept all, all except …, or reject?` Recommend "accept all", unless a correction contradicts what a source in the brain says (read the note with `brain query --read`): then "all except" it, naming the source. Say once that an edit that isn't the user's (Notion AI, an automation) can be turned down here |
| `update_fact` with `before`, `contradiction` | `<note> · <field>: <before> → <after>`, both passages. Options: the new value, keep the old one, another value, later. A `contradiction` approved keeps both values as contested; a fix picks the one that holds |
| `update_body` | the Document and the lines that change, `-` old and `+` new |
| `replace_line`, a correction group (`review_notes` with `correction`) | each restated line, old and new, lettered |
| `supersede` | the new decision replaces the older one, both named |
| `merge` | the duplicate folded into the survivor, both named |
| `new_item` | the note that would be created, and why the brain is unsure (a possible duplicate) |
| `answer` | the question and its answer, and the note that answers it. When the question is tracked (its id is in `brain sync tracked`, Tasks on), ask "An answer to a tracked question" below instead |
| `tracked_task` | "A tracked question's finished task" below |
| `set_field` | the note's Area (or an Area's Domain), old → new |
| `notion_change` | the Notion row and its field, old → new: `Send the revised quote (task): Status To Do → Done` |
| a cleanup `review_notes` (`cleanup`) | each item lettered: Remove (the note's text without the excluded lines), Restore (a paragraph is back), Keep or Remove (a note that can't be tied to a passage; Remove is the default) |
| a source's `review_notes` (one question) | `From <source title>:` then each part, `<subject> (<n> notes, <n> additions, <n> links)`, with its short view, then the items lettered on across the parts in each part's item order (changes, then notes, then links; spec/schema.md §11.3), then `Accept all, all except …, or reject?` A deferred one (`deferred_from`) is asked the same way |
| a reflection theme's `review_notes` (`fingerprint`) | the draft Document it holds: accept, reject or later |
| an `add_to_note` with `section: from_the_brain` | `From the brain, add to the end of <Document>?`, each line of its `content` lettered with the note it cites, then `All, all except …, none, or later?` (brain-ingest references/task-document.md). All: `approve`. All except: `reject` it and write one new `add_to_note` with the lines kept, approved in the same `apply`. None: `reject` |
| any other pending proposal (an `add_link` or `add_to_note` of its own, a fact with no `before` written before 0.16.0) | what it adds |

A **grouped link item** ("People on Pilot rollout: + Ana Ruiz, + Lee Chen") is one letter, decided whole. Never offer to turn down one link of a group. When the user names one ("not Lee"), say the item goes in or out whole, and ask: accept it, or turn it down (and say which link to add on its own).

**Held proposals** (`held`) are not questions: say `<n> more rest on content you excluded, so they can never be applied. Reject them?` and, on a yes, reject them together. Never look up a held proposal's title, value or text anywhere (its file, Notion, an earlier list): show its kind and target only.

### An answer to a tracked question

The question has a task that follows it up (spec/capture-and-review.md §6.4). Show the answer and the task together:
```
The March review answers "Can the site go live by the end of March?": yes, on 28 March.
Record the answer and set its task Done?
  a) yes (recommended)  b) record the answer, leave the task  c) not yet
```
- **a)** `approve` the `answer`. Then read the task's status through the MCP (`value_before`), and write a `notion_change` with `brain proposal new`: `database: tasks`, `page` = the task's page id from `brain sync tracked`, `page_title` = its title, `property: status`, `value_after` = the done status (`Done`, else the first option of the Status property's complete group), `source` = the answer's `source`, `why` = the answer. Apply it in the same `brain apply` with `decided_by: chat` and the user's words as `note`, then carry out its write and settle it ("Notion writes"). The brain sets the task Done this once.
- **b)** `approve` the `answer` alone.
- **c)** no decision: the answer waits.

### A tracked question's finished task

One question per `tracked_task` (decision 0101 §6), worded from its `task_state`:

```
The task for "Can the site go live by the end of March?" is Done. Is the question answered?
  a) yes: say the answer (recommended: the task is done)
  b) drop the question
  c) keep it open
```
- `done`: `is <task_status>`, a recommended.
- `dropped` (Won't Do): `is <task_status>` (the status as read, `is Won't Do`), b recommended.
- `gone`: `is in Notion's trash`, c recommended; say that c also unlinks the task, so "track it" can give the question a new one.
- `unreadable`: the first line is `I can't see this task any more (deleted, or no access).`, c recommended; say that c keeps the link, since the page may only be out of the brain's reach, and the question isn't asked again while the page stays unreadable.
- A task whose `page_title` isn't the question's title (the user renamed it) is named too: `The task "Ask Sam about go-live" for "Can the site go live…" is Done.`

Answers: **a** with the answer in the user's words is `fix` with `[{ "answer": "<one sentence>" }]`; "a" alone: ask for the answer in the same turn. **b** is `fix` with `[{ "drop": true }]`. **c** is `reject`: the question stays open and isn't asked again while the task stays as it is. "Later" records nothing.

## 3. Reading the answers

The CLI never interprets the user's words; you do, and you **never apply a change the words don't clearly ask for**. Read letters against the proposal itself (`brain proposal list --target <a note id>`: its `changes`, `notes` and `links`), never against what you remember. Every decision carries `note` = the user's answer as written (`"yes"` for a plain yes), `decided_at` = now (ISO 8601 UTC), `decided_by: "chat"`. Text you word yourself from an answer (a sentence to add, an answer) follows [the writing reference](../brain-query/references/writing.md) (decision 0081 §7); a value or wording the user wrote is applied as they wrote it.

- **Accept** → `approve`.
- **Reject** → `reject` (a rejected draft is archived; a rejected change changes nothing).
- **A corrected value or wording** ("yes, but it's March") → `fix` with `fixes`, by kind (spec/schema.md §11.3):
  - a fact, a contradiction, text to add, a Document's new text or an answer: one `{ "value": … }`, in the shape the fact has (`2027-03`, not "March");
  - a supersede or merge: one `{ "value": "<id>" }`, the note it should be instead;
  - a possible new note: `{ "field": "title" | <a frontmatter key>, "value": … }`;
  - an `add_link`: `{ "link": { "field", "value" }, "value": <the corrected value> }`;
  - a `notion_correction`: one `{ "value": … }` ("b, but 30 March" fixes b alone);
  - a `review_notes`: `{ "change": <index>, "value": … }` for a change, `{ "note": "<id>", "field", "value" }` for a new note ("c belongs to Acme app" → `field: projects`, `value: ["prj-…"]`), `{ "link": { "target", "field", "value" }, "value": … }` for a link.
- **On a source's question,** each part's `review_notes` gets its own decision item with the same `note`: **accept all** approves each; **reject** rejects each; **"all except b, e"** approves each part with the named items in `reject` (`{ "change": <index> }`, `{ "note": "<id>" }`, or one `{ "target", "field", "value" }` per link of a grouped item), and a part named whole ("all except Hiring") is rejected; **"later" on a part** gives that part no decision; **"later" on an item** puts it in `exclude` (it moves to a new pending `review_notes`).
- **On the corrections question,** one decision item per correction, with the same `note`: accept all approves each, "all except b" rejects b and approves the rest, reject rejects each.
- **A wording to redraft** ("say the pilot, not the trial", "shorter"): draft the new wording in the same turn, show it and ask for a yes; the accepted wording is a `fix`. A redraft that draws on a passage the proposal doesn't list is a new proposal with its own passages, not a fix.
- **A fix and an except together** ("all except b, and a is March"): `fix` with `fixes` and `reject`, never on the same item. Names become ids through `brain query --candidates "<the name>"`; a name that matches no note, or two, → ask.
- **A different change** in an answer (a role typed while answering a link, a fact about another note): decide this question as asked, and write the other change as its own proposal with `brain proposal new` (`why` = the user's words, `source` = this proposal's `source`, `passages` = `["user-correction:<this proposal's id>"]`), then ask it.
- **Unclear** → ask again, quoting the words. Don't guess.

**Apply** once per round: `brain apply --input <file>`, the decisions in the order asked.
```json
{ "decisions": [
  { "proposal": "prp-…", "action": "approve", "note": "1a", "decided_at": "<now>", "decided_by": "chat" },
  { "proposal": "prp-…", "action": "fix", "note": "2: 90000 EUR", "fixes": [ { "value": 90000 } ], "decided_at": "<now>", "decided_by": "chat" },
  { "proposal": "prp-…", "action": "approve", "note": "all except b", "reject": [ { "change": 1 } ], "decided_at": "<now>", "decided_by": "chat" }
] }
```

## 4. Finish

1. **Read the results** of each item:
   - **`applied`:** done. **`awaiting_notion`:** an approved `notion_change`; carry out its write ("Notion writes"). Without Notion reachable, leave it: the proposal stays `approved` and the next run carries it out.
   - **`closed`:** a rejection, `STALE_PROPOSAL` (the note changed since: tell the user its current value) or `SOURCE_EXCLUDED` (it rested on content the user excluded: say so without its wording).
   - **`review_notes`** results list `notes` (`reviewed`, `archived`, `kept_draft`, `unchanged`), `changes` (`applied`, `dropped`, `deferred`, `rejected`) and `deferred` (the new pending proposal holding what was left for later). Name the `kept_draft`, `unchanged`, dropped and deferred items once, under Check.
   - **`failed`:** report the reason. `FIX_UNKNOWN` or `EXCLUDE_UNKNOWN`: a letter the proposal doesn't have; read the answer again. `INVALID_RESULT`: a value of the wrong shape. Don't re-run `apply` without changing its input.
2. **Rebuild:** `brain index`, `brain views`, `brain lint`. If lint reports an error in a file this run changed, stop and report; don't commit.
3. **Commit:** `apply: <n> applied, <n> closed`, the proposal titles in the body.
4. **Publish** *(Notion configured, per `settings.publish`; with `ask`, ask once)*: `brain sync render --changed`, write the pages through the MCP, `brain sync record`, as brain-ingest references/notion.md "Publish" says; `brain log publish - pages=<n>`; commit `publish: decisions`. This gives the notes just made `reviewed` their pages, puts a rejected correction's value back in Notion, and updates the Briefs. Then push per `settings.push` (the brain's AGENTS.md, "Write path"), never off the working branch.
5. **Report** in three lines, short (decision 0037):
   ```
   Done: 6 decided (4 applied, 1 rejected, 1 closed: stale)
   Needs you: 3 decisions still wait
   Next: say "more", or "what needs my decision" later
   ```
   Below them, only when there is something: **Fixes** (each correction you read, repeated back: "2: budget set to 90000 EUR") and **Check** (stale items with the current value, deferred items, failures). Never ids, paths or commands. Then the backup line (brain-setup references/backup.md, "The report's last line").

## Notion writes

A `notion_change` changes a Notion-owned field (a task's Status, Due, Project or Area, a project's Status, an Area's Archived). The CLI can't write Notion, so `brain apply` records the decision and hands back the write in `data.notion_writes`; the skill that ran it carries out every item and settles it. A recorded decision is the user's, so a run without the user carries out these writes too.

For each item `{ proposal, database, page_id, property, payload, expect, value }`:
1. **Read** the page's `property` through the MCP and normalize it: a status or select its option name (`null` when empty), a date its first 10 characters, a relation its page ids sorted, a checkbox its boolean. Compare a status trimmed and case-insensitive. A page Notion reports as not found, in the trash or archived, or without the property, can never be written: its result is `stale` (`<title>: not changed: the page or its <property> is gone from Notion.`). Any other failed read is a failed write (step 3).
2. **Equal to `value`:** nothing to write; `applied`. **Equal to `expect`:** update `page_id` with `{ <property>: payload }`; on success `applied`. **Anything else:** write nothing; `stale` (`<title>: not changed: it changed in Notion since I read it.`).
3. **A failed write** settles nothing and isn't retried in this run: the proposal stays `approved`, the next run carries it out, and the report names it under Needs you.
4. **Settle:** `brain proposal settle --input` with `{ "settled": [ { "proposal": "<prp id>", "result": "applied" | "stale" } ] }`, then commit the `changed` paths (`apply: <n> Notion changes`).

## Don'ts

- **Don't decide for the user.** An unanswered question stays pending, and the report says how many wait.
- **Don't edit notes or proposal files directly** (`sed`, a text editor, a script; U-18). A proposal that is wrong is rejected or fixed, and `brain apply` writes the result.
- **Don't send the user to Notion to decide.** There is nothing to decide there: every decision is made in this chat.
