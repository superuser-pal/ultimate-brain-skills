---
name: brain-setup
description: Guide a new user through the first-time setup of their brain, once and in order, resuming at the first unfinished step when asked again. It covers the prerequisites, one settings screen with defaults (Git identity, private remote, drop folder, language, modules, publish, push, MarkItDown, gh), the Notion template and the agent's Notion connection, connecting the brain's databases, the minutes prompt and Brain Assistant walked through and checked, the owner's identities, seeding the user's work (Domains, Areas, Projects, Orgs, people, key documents) through one preview written only after a yes, the first-value check (tasks, a report, the information organised, a cited answer) that must pass, the scheduled catch-up, and a setup report with no names or content, filed only after a yes. Use when the user says "set up my brain", "continue setup", "where am I in setup?", "show my setup report", "check the minutes prompt again", after `brain init`, or when `brain status` starts with a Setup line.
---

# Set up my brain

One guided setup for a new brain (decision 0078, spec/setup.md in the Ultimate Brain repository). The steps run once, in a fixed order, because each needs the one before. The user can stop at any point: asked again, the skill **resumes at the first unfinished step**.

Run every CLI command as `brain <command> --brain <brain> --json`. Exit 1 means some items need attention; read them. Exit 2 or 4 means your command or input was wrong: fix it. Exit 3 or 5 means stop and report. Exit 10: report a bug. If `brain` is not found (`command not found`), install it with `npm install -g ultimate-brain`, then retry.

## Rules for the whole setup

- **Nothing is written without a yes,** in the brain or in the user's Notion workspace, except what setup records about itself: the `setup` log lines, and the settings the user confirmed on the settings screen. The CLI writes; you ask. `brain init` stays non-interactive and no new command exists.
- **Never send the user to a path under `npm root -g`.** `brain status` gives `product.path`, the folder of the installed product. Read its files yourself (`<product.path>/notion/TEMPLATE.md`, `<product.path>/notion/minutes-format.md`, `<product.path>/notion/brain-assistant.md`) and give the user the link, or the text itself to paste.
- **Ultimate Assistant's voice** (decision 0064): short messages, one question at a time (the settings screen and the seeding preview are the two exceptions, answered as a whole), each message ending with what the user does next.
- **Required items stop setup** until they are done. Say what is missing and how to fix it, and stop there; the next "set up my brain" resumes at that step. There is no skip list: a required item can't be skipped, and an optional one is a setting whose value is recorded, so it never counts as unfinished.
- **The user can stop any time** ("stop", "later"). Log nothing for the step in progress (unless one of its checks had started, a test page or a test task: then log it `failed` with `reason=user-stopped`), commit what was written, and say: "Stopped at <step>. Say "set up my brain" to continue from there."
- **Commit** each step's writes with its log line, as `setup: <step>`: log first, then commit. **No commit before the Git identity exists** (step 2): until then, the log lines stay uncommitted and go into step 2's `setup: settings` commit, so no commit carries an identity Git made up. With `settings.push` `auto` and a remote, push after each commit (`git push`); a failed push is reported with reason `push-failed` and setup goes on.

## The `setup` log line

Each step that only an online or by-hand check can prove, and each step's outcome, is recorded with `brain log`:

```sh
brain log setup - step=<step> result=<done|failed|declined> [<key>=<value>…] --brain <brain> --json
```

- `<step>`: `started`, `prerequisites`, `settings`, `notion-mcp`, `connect`, `minutes-prompt`, `brain-assistant`, `identities`, `seeding`, `first-value`, `schedule`, `finished`. (`first-meeting` is brain-catch-up's.) Write `started` once, the first time this skill runs in a brain with no `setup` line.
- `result=failed` adds `reason=<code>` from [references/report.md](references/report.md), "Reason codes". `declined` is used only by `schedule`. `first-value` is `done` only when first value passes, else `failed` with `reason=first-value-unresolved`. A step can be logged several times: its latest line is its state.
- Extra keys: `prerequisites` adds `notion_ai=yes|no custom_agents=yes|no`; `seeding` adds `notes=<n> documents=<n>`; `first-value` adds `tasks=`, `report=`, `organised=` and `answer=`, each `pass`, `fail` or `unsuitable` (`tasks` also `skip`, with Tasks off), and leaves out a check not run yet.
- **Values never carry names, paths, ids or the user's words.** Only the codes and counts above.

Read the lines back with `grep -h ' setup - ' <brain>/log/*.md`, oldest first, and take each line's `step=` and `result=` (the CLI writes an empty title, `setup - "" step=…`).

## Start or resume

On "set up my brain" (or "continue setup"):

1. **Status.** Run `brain status`, and `brain config get settings` (status shows only `publish`, `push` and `unattended`; `recall`, `markitdown`, `gh` and `schedule` are in `brain.json`, absent meaning `off`). Note `product.path`, `modules`, `notion`, and the `setup` block: `checks` (`git_identity`, `remote`, `databases`, `drop_folder`, `language`, `owner_person`), `recorded` (the timestamps of `notion-mcp`, `minutes-prompt`, `brain-assistant`, `seeding`, `first-value`, `schedule`), `first_value` (the latest first-value attempt, when `status` has it), `template_version`, `required`, `next`, `finished`. Read the `setup` log lines too, for the steps `recorded` doesn't hold (`prerequisites`, `settings`, `connect`, `identities`, `finished`). No `setup` line at all: log `step=started result=done`.
2. **Online checks**, the cheap ones `status` can't make:
   - **Notion:** search for the page **Brain Data** through the Notion MCP. Found once: the connection works. No Notion tools in this session, or not found: step 3 is unfinished again, even when it was recorded.
   - **The remote is private,** when `settings.gh` is `on`: `gh repo view --json isPrivate` in the brain folder. `false`: step 2 is unfinished again ("Your brain's remote is public. Make it private on your Git host, or say "make it private" and I'll run `gh repo edit --visibility private --accept-visibility-change-consequences`").
   - **A recorded step whose online check fails now** is logged `failed` with its reason (`notion-unreachable`, `brain-data-not-found`, `remote-failed`), then `brain status` is run again, so the count below is the one after the checks.
   - **Never re-run a by-hand check recorded as done** (the minutes prompt, Brain Assistant): its log line is the proof. The user can ask for it again ("check the minutes prompt again"), and then it runs and logs again.
3. **Find the first unfinished step,** in this order:

   | # | Step | Done when | Guide |
   |---|---|---|---|
   | 1 | Prerequisites | the latest `prerequisites` line is `done` | [references/prerequisites.md](references/prerequisites.md) |
   | 2 | Settings screen | the latest `settings` line is `done`, `checks` `git_identity`, `remote`, `drop_folder` and `language` pass, and the remote is private (when `gh` is on) | [references/settings.md](references/settings.md) |
   | 3 | Notion template and connection | `notion-mcp` is recorded and the search above finds Brain Data once | [references/notion.md](references/notion.md), "Step 3" |
   | 4 | Connect the brain to Notion | `checks.databases` passes (log `connect` done when it has no line yet) | [references/notion.md](references/notion.md), "Step 4" |
   | 4a | The minutes prompt | `minutes-prompt` is recorded | [references/notion.md](references/notion.md), "Step 4a" |
   | 4b | Brain Assistant | `brain-assistant` is recorded | [references/notion.md](references/notion.md), "Step 4b" |
   | 5 | Identities | `checks.owner_person` passes (log `identities` done when it has no line yet) | [references/notion.md](references/notion.md), "Step 5" |
   | 6 | Seeding | `seeding` is recorded | [references/seeding.md](references/seeding.md) |
   | 7 | First value | first value passes: the latest `first-value` line is `result=done`, every applicable check `pass` (`tasks` `skip` only with Tasks off). An attempt that didn't pass is unresolved: resume runs only the checks not passed | [references/first-value.md](references/first-value.md) |
   | 8 | Scheduled catch-up | `schedule` is recorded (done or declined); offered only once first value passes | [references/first-value.md](references/first-value.md), "Step 8" |
   | end | Setup report | a `finished` line exists, written only once steps 1 to 8 are done | [references/report.md](references/report.md) |

   Without Notion AI (the latest `prerequisites` line has `notion_ai=no`), steps 4a and 4b are left out: see "Without Notion AI" below. A check that failed in an earlier step (a Git identity removed since) makes that step the first unfinished one: fix only the failing item, then go on.
4. **Say where setup stands,** in one line, then start that step: "Setup: 6 of 9 done. Next: paste the minutes prompt." The counts are `setup.required.done` and `setup.required.total`, the required items only; once they are all done, say "All 9 required items done. Next: <the next step>." (describe your work, check the first results, or choose the schedule). A first run says instead: "Let's set up your brain. It takes about an hour, and you can stop any time: say "set up my brain" to pick up where you left off."
5. **Run the steps** from there, each by its guide, in order. After each, run `brain status` again before the next.
6. **Unresolved first value stops setup at step 7,** like a required item: say what is left and how to resume; no schedule, no `finished` line.
7. **Everything done:** say so in one line, and offer only what is left: the setup report when no `finished` line exists (then log `finished`), the schedule when it was never answered. Nothing else is asked.

**A brain set up before 0.14.0** (no `setup` line, and `status` says `finished`): "set up my brain" runs the same way. It writes `started`, checks each step, records what passes, and goes on from the first unfinished one, so the user can use it to check an older brain.

## Without Notion AI

Early access (0.14.0) requires Notion AI; the prerequisites say so when the user answers no (references/prerequisites.md). This path is for 1.0, when Notion AI becomes optional. Before then, take it only when the user chooses it after hearing it is not yet supported for early access:

- The minutes prompt (4a) and Brain Assistant (4b) are dropped from the required items, and the count becomes 7. Say on the settings screen what is lost: no structured minutes and no choice of what enters the brain from a meeting; no `/Today` or other Notion buttons that message Brain Assistant.
- Meetings come from any transcript or summary pasted onto a meeting page, and are ingested whole (no selection).
- How-to questions go to the agent (the brain-howto skill).
- Rewriting a pasted transcript into the minutes format is not offered.
- `prerequisites` is logged with `notion_ai=no`; `brain status` then counts 7 required items.

## Asked outside the steps

- **"Show my setup report":** [references/report.md](references/report.md), at any point, also while first value is unresolved. Showing or filing it marks nothing done and unlocks nothing.
- **"Check the report again"** (or any first-value check): run that check (references/first-value.md) and log a new attempt.
- **"Check the minutes prompt again"** or **"check Brain Assistant again":** run that check (references/notion.md) and log it again, whatever was recorded.
- **"Turn on markitdown"**, **"turn off gh"**, **"change my drop folder":** the settings screen's item, applied alone (references/settings.md, "Changing one setting later").
- **Something setup doesn't cover** (a catch-up, a question to the brain): say setup is paused at its step, and hand over to the skill for it.
