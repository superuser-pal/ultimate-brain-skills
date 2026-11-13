# Memory: opening recall, "remember this" and "wrap up"

The product's contract is its spec/memory.md (decision 0074). This file is how the agent carries it out. Memories are lessons for future sessions: preferences, constraints, the reasons behind choices. They are not knowledge about the world, and they never reach Notion.

## 1. At the start: read the pack

When the repo's "Ultimate Brain" block has the recall paragraph, run `brain recall --pack --json` in the repo before substantive work. Add `--task "<the task in the user's words>"` when you know it. Read its `text`.

- **Read it silently.** Don't recite it, and don't list what you loaded.
- **Mention a memory only when it shapes your approach,** in one line with its origin: "Using your rule for this repo: ask before running migrations." Say `(inferred)` when the pack says so: the user approved it, but it is still the brain's inference.
- **`work` is where the last session stopped:** each active task, with its `**Stopped:**` line. Start from there, and say in one line where you pick up. Check the branches (`git branch`) and, when the repo has a remote, the open pull requests (`gh pr list`); the pack doesn't list them. Never invent progress that no record shows.
- **`caller` is this folder's place in the brain:** its `project`, `area` and `stacks`. Keep it: the closing review's reach comes from it (§3.2).
- **`omitted` is not zero:** more memories exist than fit. When a decision needs them, search (§4). Never treat the pack as complete.
- **`work_unread` is set:** say which file couldn't be read, in one line, and go on.
- **An empty `text`:** nothing to load. Say nothing about it.

## 2. "Remember this", at any time

Show that one candidate (§3.2) and ask. Apply the answer as §3.3 says. Don't wait for "wrap up".

Suggest a memory yourself during the work only when forgetting it would change the current work materially, and at most once per subject per session.

## 3. "Wrap up": the closing review

The user says "wrap up", "let's close", "end of session" or similar. In Claude Code you may also offer it once when a task is finished: "Want me to save what we learned?" A no ends it. Codex makes no offer.

### 3.1 Record where the work stopped

If work is unfinished, write **one** line under its task row, in the repo's task file: `**Stopped:** <YYYY-MM-DD>: <what is done>; <what was tried and failed>; <open questions>; next: <the next action>`, under 300 characters (the pack cuts it there). A later `**Stopped:**` line replaces the earlier one. Commit it as the repo's rules say; the pack reads the working tree, so an uncommitted line still counts. For a task in GitHub or GitLab issues, write one comment instead. In a repo whose rules forbid the edit (a task file you don't own), write nothing and say so in the summary. A one-off event belongs here, not in a memory.

### 3.2 Show at most five candidates

Choose them in this order: reusable constraints, then decisions with their reasons, then costly lessons. When there are more, say how many. Every "remember this" from the session is shown as well, beyond the five.

For each:

```text
1. Ask before running migrations in acme-api: the production database is shared.
   Reach: project acme-api (prj-9x4t1b7e)
2. Run the slow tests only before a push. (inferred: you stopped me twice during edits, at 14:10 and 15:02)
   Reach: general
   Replaces: "Run every test after each edit" (mem-6t2b9k4d)
```

- **Text:** one to three sentences, in the user's terms.
- **Reach:** the narrowest the user's words support, from the pack's `caller` (or the folder's `.brain`). A rule said about this repo or project is `project` with the caller's project; about a whole area, `area` with its area; about a technology, `stack` with that stack. Use `general` only for explicit global wording ("always", "in every repo").
  - **When the narrow reach has no id** (the repo is linked without a project, or without that stack), don't widen it silently. Show `Reach: none yet: this repo isn't placed under a project`, and offer two answers: save it as `general`, or place the repo first (`brain link <repo> --project <prj-id>`, run from the brain), then save it as `project`. Decide the reach before you show the candidate, so the user approves what is saved.
- **`inferred`** when the user didn't say it in those words, with one to three examples from the session.
- **Replaces** when an eligible memory says something different. Find it with `brain recall --search "<the subject>" --json`.

Then: "Say yes, an edit, or no for each (1 yes, 2 no)."

### 3.3 Apply the answers

| Answer | Do |
|---|---|
| yes | `brain proposal new --input <file> --json`, then `brain apply --input <file> --json` with the decision below |
| an edit ("2 yes, but only for acme-api") | the same, with the user's text or reach |
| no, later, or nothing | nothing. Don't keep it anywhere |

The proposal, one per approved candidate:

```json
{ "proposals": [ {
  "kind": "new_item",
  "title": "Remember: Ask before running migrations",
  "why": "said yes at the closing review",
  "source": "agent:brain-query/20261108T140000Z",
  "passages": ["agent:brain-query/20261108T140000Z"],
  "note": { "type": "memory", "title": "Ask before running migrations",
    "frontmatter": { "summary": "acme-api: ask before running migrations; the production database is shared.",
      "scope": "project", "projects": ["prj-9x4t1b7e"], "confidence": "verified", "origin": "acme-api",
      "sources": ["agent:brain-query/20261108T140000Z"] },
    "body": "Ask before running migrations in acme-api: the production database is shared.\n" } } ] }
```

The decision, for each proposal id that `proposal new` returned, with the current time:

```json
{ "decisions": [ { "proposal": "prp-…", "action": "approve", "decided_at": "2026-11-08T14:31:05Z", "decided_by": "chat" } ] }
```

- `source`, `sources` and `passages` hold the session key `agent:brain-query/<the session's start, YYYYMMDDTHHMMSSZ>` (`proposal new` refuses a proposal without `passages`). Add to `sources` and `passages` the ids of brain notes the lesson comes from, when there are any: only notes `brain query --read` or `brain recall` returned.
- `scope` with exactly its list: `projects`, `areas` or `stacks`, never two. `general` has none.
- `confidence`: `verified` when the user said it, `inferred` when you drew it from the session, `unverified` when the user doubts it. Approval never changes it.
- `origin`: the `repo` of the folder's `.brain`, or `brain`.
- **A candidate that replaces a memory:** after its `new_item` is applied, a second proposal `{ "kind": "supersede", "title": "…", "why": "…", "source": "<the session key>", "passages": ["<the session key>"], "target": "<the new mem- id>", "supersedes": "<the old mem- id>" }`, approved the same way. The old memory stays, archived.

Then commit in the brain: `git -C <brain path> add -A memories _proposals log` and `git -C <brain path> commit -m "memory: <title>"` (or `memory: <n> lessons`). The brain path is `brain status --json`'s. Push per `settings.push`, never off the brain's working branch: the memory belongs on the working branch (`brain status`'s `branch.working`), and you never create a branch, a worktree or a pull request in the brain (decision 0086). With the warning `BRAIN_OFF_WORKING_BRANCH` and `on_working` `false` (or `working` `null`), commit but don't push: "fix my backup" brings the commit back. Then end with the backup line (brain-setup references/backup.md, "The report's last line"), with " in a session in your brain" before its full stop, since "fix my backup" runs only there: none after a push that succeeded; `<n> changes not backed up yet (Back up after each run: remind me).` with `remind`; `Not backed up: <reason>. Say "fix my backup" in a session in your brain.` when the push failed or wasn't made. From a linked repo, this is the one write the brain gets; everything else stays read-only.

End with one line: `Saved <n> lessons; <n> declined. Stopped line on <task>.` (or `No work left open.`).

## 4. Searching memories

`brain recall --search "<words>" --json` returns the approved memories that reach this folder, ranked. When a decision needs a memory's whole text, read it with `brain query --read <mem-id> --json`: it returns a memory that reaches this folder, is approved and is replaced by nothing.

**History, only for a question about the past** ("what was the rule before it changed?"): add `--include-superseded` to the search, which also returns the replaced memories that reach this folder and aren't drafts, after the current ones, each marked `superseded_by`. Read a replaced memory's whole text with `brain query --read <mem-id> --historical --json`; without `--historical` it is withheld. Give the old rule as history and name what replaced it. A question about how things are now, and the "Replaces" check of §3.2, never use either form.

A memory file found any other way (a grep, a folder listing, `brain index --json`) is not eligible and is never used or mentioned.

## 5. A conflicting instruction

When the user asks for something that contradicts a memory, do it for this task only, and write nothing. At "wrap up", if the difference matters, ask: "Should this replace your rule '<old>' from now on?" A yes, or the user saying "from now on" earlier, makes it a candidate that replaces the old one (§3.2). No memory expires by date. When newer evidence challenges one, say so and offer the replacement; don't drop it silently.
