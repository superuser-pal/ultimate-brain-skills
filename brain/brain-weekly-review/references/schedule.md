# Run on a schedule

When the user says "review my week every Monday", "run the weekly review on a schedule", "turn on the weekly review" or "stop the weekly review". What a scheduled run does is SKILL.md's "Unattended".

From 0.17.0 the schedule is kept in the brain and asked by setup (decision 0110 §7, §8): this is for a brain whose setup is finished, or one that declined the weekly review then. Follow brain-catch-up's [schedule reference](../../brain-catch-up/references/schedule.md), the one procedure for both jobs, for the job `weekly-review` alone:
- **Ask** only what is missing, once: the time, when not Monday at 08:00, and, when `brain status`'s `schedule.recorded` is false, the agent and its model (with Claude Code, Sonnet by default as a full id, decision 0093 §4; with Codex, the model you are running as).
- **Offer** `settings.publish: auto` when it is `ask` (a scheduled run publishes nothing otherwise, so the week's row waits for your next session), and with Claude Code the allow list with the weekly review's own rules (`Bash(date:*)`, `Bash(jq:*)`, `Read(~/.ultimate-brain/weekly/**)`, `Edit(~/.ultimate-brain/weekly/**)`). The run writes in Notion only the week's row.
- **Install** with `brain schedule install weekly-review --at 08:00 --days mon` (and `--max-budget-usd <settings.weekly.max_usd>` with Claude Code: 3 on Sonnet, 8 after `brain config set settings.weekly.max_usd 8` on Opus; nothing with Codex, which has no spend ceiling). It writes `settings.schedule` itself: never write `settings.weekly.schedule`, which a brain from before 0.17.0 may still have and keeps.
- **Pass on** the trust step with Claude Code (`FOLDER_TRUST`), the computer's line by platform, and that it runs on this computer only.
- **Stop:** `brain schedule remove weekly-review`, then commit `brain.json` (`schedule: weekly-review off`).

The weekly review is a separate job from the scheduled catch-up: neither runs the other.
