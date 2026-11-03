---
name: brain-howto
description: Explain how the user's second brain works and teach them to use it, answering from the user guide and checking the brain's live state when the question is about something that happened. Read-only. Use when the user asks "how do I…", "what does … mean", "why didn't my meeting get ingested", "where do I find…", "what should I say to…", or wants a tour of the Notion Spaces. For questions about what the brain knows ("what did we decide…"), use brain-query.
---

# Explain the brain

Answer how-to questions about the system from [references/guide.md](references/guide.md), the user guide. It is the single source of truth for how the user works with the brain: the Spaces, the meeting flow, Review, ownership, what to say to the agent, and fixes for common surprises. **Read-only:** this skill explains; it never changes the brain or Notion.

## Procedure

1. **Read the guide section** that matches the question. Its headings: The Spaces · The meeting flow · Deciding in Review · Correcting what came in (a meeting, a capture, a report; refreshing a report) · What you can edit · Adding things · Run catch-up on a schedule · What to say to your agent · When something looks wrong.

2. **If the question is about something that happened** ("why didn't…", "where did … go", "is my … set up"), check the live state before answering:
   - `brain status --brain . --json` (or without `--brain` in a linked repo). It reports pending proposals, Notion databases configured or missing, stale views, and the last log line.
   - If the Notion connection is available, read the record in question (for example the meeting's Brain Status). Read only.
   - If the CLI exits 3 (`BRAIN_NOT_CONFIGURED`, `BRAIN_NOT_FOUND`), answer from the guide alone and say the brain isn't configured on this machine.

3. **Answer** in the guide's terms:
   - Lead with the answer in one or two sentences. Then give the steps, naming the Space, tab and property exactly as the guide does ("Meetings → To review", "set Brain Status to Reviewed").
   - When the answer involves the agent, quote the phrase from "What to say to your agent", and offer to run that skill now.
   - When you checked the live state, say what you found ("your meeting 'Acme weekly' is still Not Reviewed").

4. **If the guide doesn't cover it,** say so, and answer from the product docs only if you can cite them (docs/notion-space-design.md, the decisions). Flag the gap so the guide can be extended.

## Teaching mode

When the user asks for a tour or is new, walk through the guide in this order: the three parts, Home, the meeting flow, Review, what you can edit. Stop after each part and ask whether to continue.

## Example (synthetic Acme brain)

**Question:** *"I marked the Acme weekly as reviewed yesterday but nothing showed up in Review. Why?"*

`brain status` shows the last log line is from three days ago, so no ingest has run since. The answer:

> No ingest has run since you marked it: the brain's last run was on 2026-12-03. Marking a meeting Reviewed only makes it ready; the brain reads it when you say **"ingest my reviewed meetings"**. Want me to run it now?
