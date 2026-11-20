# Schedule the brain

The one procedure for the brain's two scheduled jobs, the daily **catch-up** and the **weekly review** (decision 0110 §7 to §9). Read by brain-catch-up when the user asks for a schedule ("schedule my brain", "run catch-up every morning", "twice a day", "on weekdays", "stop the scheduled catch-up", "what is scheduled?"), by brain-weekly-review's schedule reference, and by brain-setup's step 8, which asks both slots. What a scheduled run does is in [unattended.md](unattended.md) and brain-weekly-review's "Unattended".

**The schedule is kept in the brain** (`settings.schedule` in `brain.json`): the agent, the model it pins and each job's times. `brain schedule install` writes it and installs this computer's entries from it, so installing again, or on another computer, gives the same times. The entry runs the brain's agent with nobody there: Claude Code (`claude -p`) or Codex (`codex exec`). On a Mac it is a launchd agent; on Windows a Task Scheduler task; elsewhere a cron line the user adds.

Start with `brain status`: note `schedule` (`recorded`, `agent`, `model`, `platform`, and each job's `slot`, `installed` and `matches`), `settings.publish`, `modules` (Reports) and `product.path`. Off the working branch, say so and offer "fix my backup" first (brain-setup references/backup.md).

## 1. Ask what is missing, once, in one message

- **The slots.** With no slot recorded for a job, offer its default: the weekly review **every Monday at 08:00**, the daily catch-up **every day at 07:30**. Asked for both (setup, or "schedule my brain"): `Run the weekly review on its own every Monday at 08:00, and a catch-up every day at 07:30? Keep them, change a time or a day, or say no to either.` Asked for one job, offer that one. A changed time or day is taken as said ("weekly on Fridays at 17:00", "catch-up at 07:00 and 13:00 on weekdays"); a declined slot is `off`.
- **The agent and its model**, only when `schedule.recorded` is false (no object yet), or the user asks to change them. The agent is the one you are running in: Claude Code is `claude`, Codex is `codex`. The model is a **full id**, never a name that moves: with Claude Code offer Sonnet by default as its full id (the current one, such as `claude-sonnet-5-5`), and the user may pick another (Opus, `claude-opus-5-5`); an alias such as `sonnet` or `opus` is refused, because it moves under the schedule. With Codex offer the model you are running as, by its full name as Codex lists it. Once the object exists, every job uses its agent and model; changing either reinstalls every job with the new one.

Say what each run does, in one line each:
- **Catch-up:** it takes in what you've marked ready, at most 10 inputs a run, oldest first (`brain config set settings.unattended.max_inputs <n>` changes it), applies what you ticked in a Ready weekly row, and leaves anything that needs your reading for your next "catch up".
- **Weekly review:** every Monday it writes the week's row (Your week, then Clean-up), cleans up the mechanical items alone, each with an undo, and decides nothing else; a quiet week writes nothing. With Claude Code each run stops at a cost ceiling: 3 USD on Sonnet, 8 on Opus. With Codex there is none: the run stops at its own time and judgment budget.

## 2. Offer once each, in the same message, and change each only after its yes

- **Reports,** when the module is off and the catch-up is kept: `Turn on Reports to get a row in the Inbox when a scheduled catch-up needs you?` It follows notion/modules/reports.md (under `product.path`).
- **`settings.publish: auto`,** when it is `ask`: a scheduled run publishes nothing otherwise (no weekly row, no Catch-up row, no ticks applied that write to Notion), and waits for your next session. `brain config set settings.publish '"auto"'`.
- **The tools it may use, with Claude Code only.** A scheduled `claude -p` can't ask permission: it uses only what the brain's `.claude/settings.json` allows and refuses the rest, which the run logs as a failure. Offer to add to `permissions.allow`: `Bash(brain:*)`, `Bash(git:*)`, `Read`, `Edit`, `Write` and the Notion server's tools (`mcp__<server>`, named as `claude mcp list` names it); with the weekly review kept, also `Bash(date:*)`, `Bash(jq:*)`, `Read(~/.ultimate-brain/weekly/**)` and `Edit(~/.ultimate-brain/weekly/**)` (its snapshot and working files). Merge them into the file as it is, keeping every other key. With Codex there is no list to offer: the run's permissions are its command's sandbox (it may write in the brain folder and reach the network for the backup), and its Notion connection is the user's own Codex configuration.

## 3. Say what the computer needs, in one line, by `schedule.platform`

- `darwin`: `Your Mac must be on (asleep is fine) and you logged in at these times; a run missed while it was off waits for the next one.`
- `win32`: `Your computer will be woken for these times; you must be logged in.`
- other: `This system has no scheduler the brain manages: I'll give you lines to add with crontab -e, and your computer must be on at these times.`

And in the same message: `The schedule runs on this computer only. If the brain was scheduled on another computer, say "stop scheduling the brain here" there.`

## 4. Install, after the yes

1. With Claude Code and the weekly review on Opus, first `brain config set settings.weekly.max_usd 8`.
2. For each kept slot, `brain schedule install <job> --at <HH:MM>[,<HH:MM>…] [--days <day>,…] --agent <agent> --model <id> --brain <brain> --json`, the job `catch-up` or `weekly-review`. Leave `--days` out for every day. Pass `--agent` and `--model` on the first install (no object yet) or when the user changed them; leave them out after. For `weekly-review` with Claude Code add `--max-budget-usd <settings.weekly.max_usd>` (default 3); never with Codex, which refuses it.
3. For a declined slot, once the object exists, `brain schedule remove <job>` (its slot becomes `off`). Both declined and no object yet: `brain config set settings.schedule '"off"'`: nothing is installed, and setup doesn't ask again.
4. Commit `brain.json`, and `.claude/settings.json` when it changed: `schedule: <catch-up 07:30 · weekly Mon 08:00 | off>`. `install` and `remove` write `brain.json` and nothing else in the brain.

**What `install` answers:**
- **`FOLDER_TRUST`** (every install with Claude Code): a scheduled `claude -p` ignores the brain's allow rules until Claude Code has been opened in the brain folder and its trust dialog accepted, and the CLI can't tell whether that happened. Pass it on in one line: `Before the first run, open Claude Code in <brain> once and accept the trust dialog, or the scheduled run can't use the tools you just allowed.` With Codex there is no such step.
- **`NO_SPEND_CEILING`** (`weekly-review` with Codex): say it once, as it is.
- **`SCHEDULE_NOT_LOADED`**: the entry is written but not running. Say so with the scheduler's message (launchctl's on a Mac, PowerShell's on Windows): the choice is kept in the brain, and "schedule my brain" installs it again.
- **`cron`** lines (elsewhere): give them to the user to add with `crontab -e`; the brain can't list or remove them (`SCHEDULE_NOT_MANAGED`).
- **`AGENT_NOT_FOUND`**: the agent isn't on `PATH` here (Claude Code or Codex): install or sign in to it, then ask again. **`BRAIN_NOT_GIT`**: Codex runs only in a Git repository; the brain folder isn't one (a brain from `brain init` always is): say so and stop. **`SKILL_MISSING`**: the brain lacks the job's skill: `brain upgrade`, then again.

A failed install leaves the choice written in `brain.json`; `brain status` shows the job not installed on this computer, and the next "schedule my brain" installs it.

## 5. Check, change, move and stop

- **"What is scheduled?"** `brain schedule list`: each entry on this computer with its times, days, agent and model, and whether it `matches` the brain's schedule. Say it in one line a job; an entry that doesn't match: `The <job> here differs from your brain's schedule: say "schedule my brain" to install it as recorded.`
- **Where a run's output goes:** on a Mac `~/Library/Logs/ultimate-brain/`, on Windows `%LOCALAPPDATA%\ultimate-brain\logs\`, one file per job. After the first catch-up, "catch up" opens with what the scheduled runs did; after a weekly run, every session opens with `This week's review is ready: …`.
- **Another time:** asking again with other times replaces the job's entry and slot.
- **"Schedule my brain" on another computer, or after a reinstall:** with the schedule recorded (`schedule.recorded` true) and a job not installed here, `brain schedule install` with no job installs this computer's entries from `brain.json`, as recorded, then step 3's computer line and the trust step. `SCHEDULE_NOT_SET` means nothing is recorded yet: ask the slots (step 1).
- **"Stop the scheduled catch-up"**, **"stop the weekly review":** `brain schedule remove <job>`, then commit `brain.json` (`schedule: <job> off`).
- **"Stop scheduling the brain here"** (a computer that should no longer run it): `brain schedule remove --here`. It removes this computer's entries and leaves the brain's schedule as it is, for the computer that runs it.

**A brain scheduled before 0.17.0** (`settings.schedule` is the string `on`, `schedule.recorded` false): its entry keeps running as it is. Asked to change it, or "schedule my brain", ask the slots and the model as for a first schedule; `install` then writes the object and keeps what the old entry had.

**Other schedulers.** Any scheduler that runs the job's command in the brain folder, signed in as the user and with their Notion connection, does the same job: `claude -p "catch up unattended" --model <id>` or `codex exec --model <id> --sandbox workspace-write -c approval_policy=never -c sandbox_workspace_write.network_access=true "catch up unattended"` (and `weekly review unattended` for the weekly job). An always-on agent such as Hermes can hold that command. Claude Code's cloud schedules don't qualify yet: they start from a fresh clone, with no drop folder, no linked repos and no local Notion login. The brain doesn't manage those entries.
