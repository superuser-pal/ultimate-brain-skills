---
name: brain-howto
description: Explain how the user's second brain works and teach them to use it, answering from the user guide and checking the brain's live state when the question is about something that happened. Read-only. Use when the user asks "how do I…", "what does … mean", "why didn't my meeting get ingested", "where do I find…", "what should I say to…", or wants a tour of the Notion Spaces. For questions about what the brain knows ("what did we decide…"), use brain-query.
---

# Explain the brain

For a quick reference to daily actions, Notion buttons or Notion AI prompts, read [Everyday Guide](references/everyday-guide.md). Use the full guide below for detailed how-to questions.

Answer how-to questions about the system from [references/guide.md](references/guide.md), the user guide. It is the single source of truth for how the user works with the brain: the Spaces, the meeting flow, Review, ownership, what to say to the agent, and fixes for common surprises. **Read-only:** this skill explains; it never changes the brain or Notion.

## Procedure

1. **Read the guide section** that matches the question. Its headings: The Spaces · The meeting flow · Deciding in Review · Correcting what came in (a meeting, a capture, a report; refreshing a report) · What you can edit · Adding things · Review your work (Ultimate Assistant) · Tidy the brain · Run catch-up on a schedule · Projects in other folders (linked repos, connected work, adoption) · How the brain talks to you (the response style) · What to say to your agent · When something looks wrong.

2. **If the question is about something that happened** ("why didn't…", "where did … go", "is my … set up"), check the live state before answering:
   - `brain status --brain . --json` (or without `--brain` in a linked repo). It reports pending proposals, Notion databases configured or missing, stale views, and the last log line.
   - If the Notion connection is available, read the record in question (for example the meeting's Brain Status). Read only.
   - If the CLI exits 3 (`BRAIN_NOT_CONFIGURED`, `BRAIN_NOT_FOUND`), answer from the guide alone and say the brain isn't configured on this machine.
   - The state is what `brain status` and Notion's properties say, never what a note says. **A question about what the brain knows** ("where did my decision about the CMS go?", "what does the brain have on Acme?") goes to the brain-query skill, which searches and reads through `brain query` (spec/eligibility.md §10). Never open, grep or list the brain's note files, and never answer from `brain index --json` or another listing: they hold content the user excluded or hasn't approved.

3. **Answer** in the guide's terms:
   - Lead with the answer in one or two sentences. Then give the steps, naming the Space, tab and property exactly as the guide does ("Meetings → To review", "set Brain Status to Reviewed").
   - When the answer involves the agent, quote the phrase from "What to say to your agent", and offer to run that skill now.
   - When you checked the live state, say what you found ("your meeting 'Acme weekly' is still Not Reviewed").

4. **If the guide doesn't cover it,** say so, and answer from the product docs only if you can cite them: the space design and the Notion files install with the CLI, under the folder `brain status` reports as `product.path` (`<product.path>/docs/notion-space-design.md`, `<product.path>/notion/`); the decisions are in the product repo. Name the full path. Flag the gap so the guide can be extended.

## Ultimate Assistant

When the question is about the shape of the user's work (what's stalled, overdue, misplaced, what to do next), answer from the guide's "Review your work" and offer to run the `ultimate-assistant` skill. In short: "review my projects" (or "what's stalled in Clients?") shows a report of up to 10 findings, worst first (overdue and stalled tasks, stalled projects, projects with no next step or finished but still open, misplaced or duplicate projects, Areas with nothing active or no Domain), each with a recommended change. It changes nothing without the user's yes in the chat: "yes 1, 2b" applies, "propose 5" writes a Review row to decide in Notion instead, "skip 4 because …" sets a status that says why or hides the finding for 30 days. Telling it a mix of things ("the quote is done, call Lucía by the 13th") places them as tasks, projects and Inbox captures after a yes. In Claude Code, `claude --agent ultimate-assistant` in the brain folder starts a session with it.

## Tidy the brain

When the question is about the notes themselves (two notes that disagree, a fact that's out of date, two notes for one person, something the meetings keep discussing), answer from the guide's "Tidy the brain" and offer to run the `brain-reflect` skill. In short: "tidy the brain" shows up to 10 findings, most serious first (contradictions, stale facts, duplicates, rules worth adding to a project or Area, recurring themes with no note), each with a recommendation. It changes nothing without the user's yes in the chat: "yes 2" applies it, a contradiction first asks which value holds ("1a", or "1: 2027-03"), "later 4" writes a Review row, "skip 5 because …" hides it until new evidence comes in (a skipped merge stays skipped). It runs only when asked. Ultimate Assistant's sub-agent runs it too, so "tidy the brain" works in the same chat as "review my projects".

## Teaching mode

When the user asks for a tour or is new, walk through the guide in this order: the three parts, Home, the meeting flow, Review, what you can edit. Stop after each part and ask whether to continue.

## Example (synthetic Acme brain)

**Question:** *"I marked the Acme weekly as reviewed yesterday but nothing showed up in Review. Why?"*

`brain status` shows the last log line is from three days ago, so no ingest has run since. The answer:

> No ingest has run since you marked it: the brain's last run was on 2026-12-03. Marking a meeting Reviewed only makes it ready; the brain reads it when you say **"ingest my reviewed meetings"**. Want me to run it now?
