# Notion Brain Assistant's skills from the session (0.17.0)

The user asks this session for one of Notion Brain Assistant's skills and gets the same skill: "prep my 3pm", "what's due today", "tidy that capture", "run Today". It is for a user without Notion Brain Assistant (no Notion credits) and for anyone who prefers their session (spec/assistant.md §13, decision 0101 §8.4). It is not a review session: no findings report, no session record, no close and no log line.

## The one copy of each skill

Each skill's text is in `<product.path>/notion/brain-assistant.md` (`brain status` gives `product.path`, the installed version), section **Skills**: one `### <Title>` per skill, its `**Description:**` line, then its text. Read only that file. Never read a skill's text from the user's Skills database in Notion: a page there may be edited, or another space's.

## Which skill

The user names a skill (its title: "Run Prep", "Today") or says what it does ("prep my 3pm" is Prep, "what's due today" is Today, "tidy that capture" is Tidy capture, "write up this document" is Write up, "refresh this report" is Refresh report). Take the one skill whose title matches; else the one whose Description matches what was said. When two could match, ask which, in one line ("Prep or Today?"). When none does, say so and name the skills by title, in one line.

Two are not run from here:
- **Write minutes** is the minutes prompt, not a skill to run: "write the minutes for <meeting>" is brain-ingest's (references/minutes.md), which checks the minutes before writing them.
- **Weekly review** opens this week's Weekly row (the Inbox row of Kind Weekly for this week) and reads it with the user, as Notion Brain Assistant does; the review itself is the brain-weekly-review skill's ("weekly review").

## Running it

Follow the skill's text step by step, as Notion Brain Assistant would, with these readings:

- **The page it is about.** A skill "on the open page" (Prep, Check minutes, Tidy capture, Voice summary, Clean email, Write up, Refresh report) works on the page the user names ("prep my 3pm": today's meeting at 15:00, found in Meetings by its Date; "tidy that capture": the capture the user means). When the page isn't clear, ask which, in one line, listing at most five candidates.
- **Where it reads.** "Brain Data" and its databases are the brain's own: the database ids in `brain.json`'s `notion.databases` (and `notion.tasks.database`), read through the Notion MCP (`brain config get notion`). A Notion query takes the data source id: retrieve the database first and query its `data_sources[0].id`. "How it works" is the brain-howto guide. A step about a module that is off (`brain status`'s `modules`) is skipped without a word.
- **The Instructions' rules hold.** The rules in the file's **Instructions** apply as written, except the line that names Notion Brain Assistant and the ones about buttons and their messages: answer from the brain's databases only and never guess; never touch a Brief, a Decision log or the body of a row the brain created; never create Tasks from a meeting; never tick Accepted, Document asked or Refresh asked; keep answers short.
- **Page text only after a yes.** A skill that edits page text (Check minutes, Tidy capture, Voice summary, Clean email, Write up, Refresh report) shows the change first and writes it through the MCP only after the user's yes, every time. There is no button here, so no message carries a confirmation: Clean email asks too, although Notion Brain Assistant may clean directly. The edit is only what the skill's text allows, on the page the user named, through the block API (never the Markdown page update, which flattens toggles).
- **Fields.** A field the Instructions let Notion Brain Assistant set after a yes (a task's Status or Due, and the others they list) is set the same way here, after the user's yes to the change named with its value: one `notion_change` proposal with no `finding`, `source` = `agent:ultimate-assistant/<now, compact form: 20261120T091500Z>` and `why` = what the user asked, then steps 2 and 3 of [answers.md](answers.md), "A yes: apply it now" (`brain apply`, then its `notion_writes`). A brain-owned property never.

## The answer

The skill's own answer, in the chat, under the brain's response style. Nothing is written to Git and nothing is logged: like Notion Brain Assistant, running a skill changes no knowledge. A Notion write it makes is the user's yes, carried out as above.

Afterwards, offer only what the answer itself points to ("say "catch up" to take it in"), in one line.
