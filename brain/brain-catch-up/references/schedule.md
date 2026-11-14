# Run on a schedule

Read by brain-catch-up when the user asks for a schedule ("run catch-up every morning", "twice a day", "on weekdays"), and by brain-setup's first-value step when the user turns the schedule on. What a scheduled run does is in [unattended.md](unattended.md).

When the user says "run catch-up every morning" (or "twice a day", "on weekdays"):

1. **Ask what is missing, once:** the times; the days, if not every day; and the Claude model to pin, as a full id such as `claude-sonnet-5-5`. An alias such as `sonnet` is refused, because it moves under the schedule, and the skills are tested on Claude models only. Say what a run does: it takes at most 10 inputs, oldest first (`brain config set settings.unattended.max_inputs <n>` changes it), carries out the decisions they made, and leaves anything that needs their reading for their next "catch up".
2. **Offer once what makes a run useful:**
   - **Reports,** when the module is off: "Turn on Reports to get a row in the Inbox when a scheduled run needs you?" It follows notion/modules/reports.md, and only after a yes.
   - **`settings.publish: auto`,** when it is `ask`: a scheduled run publishes nothing otherwise, and writes no Catch-up row. Set it with `brain config set settings.publish '"auto"'` only after a yes.
   - **The tools it may use.** A scheduled `claude -p` can't ask permission, so it uses only what the brain's `.claude/settings.json` allows, and refuses the rest (which the run logs as a failure). Offer to add to `permissions.allow`: `Bash(brain:*)`, `Bash(git:*)`, `Read`, `Edit`, `Write`, and the Notion tools. Merge into the file as it is, keeping every other key; write it only after a yes.
3. **Install it:** `brain schedule install catch-up --at 07:00 --days mon,tue,wed,thu,fri --model <id> --brain <brain> --json` (`--days` left out means every day; `--at` takes several times, `07:00,13:00`). On macOS it writes and loads a launchd agent, and says so; with `SCHEDULE_NOT_LOADED` in `warnings`, tell the user it is written but not loaded, and show launchctl's message. Elsewhere it writes nothing and returns cron lines: give them to the user to add with `crontab -e`. `CLAUDE_NOT_FOUND` means Claude Code isn't installed on `PATH`.

   **Trust the brain folder once.** `install` always warns `FOLDER_TRUST`, because a scheduled `claude -p` ignores the brain's allow rules until Claude Code has been opened in the brain folder and its trust dialog accepted, and the CLI can't tell whether that happened. Pass it on in one line: "Before the first run, open Claude Code in <brain> once and accept the trust dialog, or the scheduled run can't use the tools you just allowed."
4. **Say how to check and stop it:** `brain schedule list` shows it; after the first run, "catch up" opens with what the scheduled runs did; a run's output is in `~/Library/Logs/ultimate-brain/`. Installing again with other times replaces it; `brain schedule remove catch-up` stops it.

**Other schedulers.** Any scheduler that runs `claude -p "catch up unattended" --model <id>` in the brain folder, signed in as the user and with their Notion connection, does the same job: an always-on agent such as Hermes can hold that command. Claude Code's cloud schedules don't qualify yet: they start from a fresh clone, with no drop folder, no linked repos and no local Notion login.
