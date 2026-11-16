# Tracking a question or risk as a task (decision 0099; spec/capture-and-review.md §6.4)

A question or risk stays a note in Git and shows in its project's or Area's Brief ("Open questions and risks"). It becomes a task only when the user says so, in one of two ways, and no other:
1. **"track it"** in the session about an open question or risk ("track the go-live question"), or a yes to the to-do tidy's Track ([todo-tidy.md](todo-tidy.md));
2. **the token `Track: Waiting On —`** on a question or risk line of an input (after any selection prefix, references/selection.md), read at the ingest that takes the line in.

You never add the token, never say "track it" for the user, and never make a task from a question on your own. With the Tasks module off (`brain status`), nothing is tracked: say `Tasks is off, so the question stays in the Brief.`, and name a token on a question line under Check.

## "track it"

1. **Find the question.** `brain query --candidates "<the user's words>" --types question`, read the candidates with `brain query --read`, and take the open one they mean (no `answer`, no `dropped`). Two fit: ask which. Already tracked (`brain sync tracked` lists it): say so, with its task, and stop.
2. **To Do or Waiting On.** "Find it out yourself" is a task To Do; "you asked someone" is Waiting On, with their name as owner when the user gives one. When the user's words don't say which (and whom), ask once: `Track "<question>" as: a) a task for you to find out b) waiting on someone (who?)`.
3. **Render:** `brain sync tasks --question <que-id> --input` with one item: `{}` for To Do, `{ "status": "waiting_on", "owner": "<name>" }` for Waiting On, `"due": "<YYYY-MM-DD>"` only when the user gives a date. The payload carries the question's title, Kind Question or Risk (or, on a mapped database without Kind, the title prefix `Question: ` or `Risk: `), its project and Area, the backlink to its meeting or Inbox row, and Brain ID = the question's id. A target in `pending_relations` is published first (references/notion.md, "Publish").
4. **Create** the task once through the MCP, then `brain sync record` with `{ "records": [ { "id": "<que-id>", "task": "<page id>" } ] }`, which sets the question's `task`. Rebuild (`brain index`, `brain views`, `brain lint`), commit `track: <question title>`, publish the Brief (`brain sync render --changed`, MCP, `brain sync record`), commit, push per `settings.push`.
5. **Confirm** in one line: `Tracked: "<question>" is a task <To Do | Waiting On Sam>, under Questions on the Tasks page.` (Risks for a risk.)

## The token in an input

A line in the "For the brain" toggle (or a subject item) such as `Track: Waiting On — Waiting on Sam: can the site go live by the end of March? [s2.i2]` that reads as a **question or risk** (extraction.md, "Questions or commitments") makes one Waiting On task for the question note the ingest writes for that line. Its owner is the `<name>` of a `Waiting on <name>:` prefix on the line, else none. A line that reads as someone else's commitment keeps the token's other meaning: a Waiting On task for that commitment (selection.md §6).

- **When:** at the read that ingests the input, in its Tasks step, after the question note is written, and only for a selected item of a confirmed input.
- **Attended:** the parts name it once (parts.md: `1 question tracked as a Waiting On task: …`), and the last part's yes creates it. **Unattended:** created the same way, with no question: the token is the user's instruction.
- **How:** step 3 and 4 above, with `{ "status": "waiting_on", "owner": "<name>" }`, or `{ "status": "waiting_on" }` with no name.
- **Never twice:** a question that already has a `task` is never tracked again, so a re-read creates no second task (`sync tasks --question` refuses it).

## When the question is answered

A later input that answers a tracked question proposes the `answer` as for any question, and the session asks it with its task: "Record the answer and set its task Done?" (brain-apply, "An answer to a tracked question"). The brain sets the task Done once, on that yes. A task the user finishes in Notion doesn't answer the question by itself: the next sync reads it, and the session asks whether the question is answered (brain-apply, "A tracked question's finished task").
