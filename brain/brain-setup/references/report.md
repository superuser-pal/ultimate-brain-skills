# The setup report

At the end of setup, and whenever the user asks "show my setup report", write the report, show it **whole**, then ask: "Send this to the product as a `beta-setup` issue, to help fix setup? Nothing else is sent." It is filed **only after a yes**. There is no telemetry: nothing is sent any other way.

## What it holds

Counts and codes only, from the `setup` log lines, `brain status` and your own name as the agent:

```text
Ultimate Brain setup report
CLI 0.14.0 · skills ultimate-brain-skills 1.4.0 · agent Claude Code · platform darwin
Notion AI: yes · Custom Agents: yes · modules: knowledge, orgs, documents, reports, tasks
Time: 52 min (first setup line to the last)
1 prerequisites: done
2 settings: done (markitdown off, gh on)
3 notion-mcp: failed once (notion-unreachable), then done
4 connect: done (template 0024)
4a minutes-prompt: failed once (shape-wrong), then done
4b brain-assistant: done (custom agent)
5 identities: done
6 seeding: done (14 notes, 4 documents)
7 first value: passed on attempt 2 · tasks pass · report pass · organised pass · answer pass
8 schedule: off
```

- **Header:** the CLI version (`brain --version`), the skills snapshot's name and version (`skills` in `brain status`), the agent (Claude Code or Codex), the platform (`node -p process.platform`).
- **Plan and modules:** `notion_ai` and `custom_agents` from the latest `prerequisites` line; the modules that are on.
- **Time:** from the first `setup` line to the last, in minutes (hours and minutes above 90).
- **One line per step,** from all its lines in order, the latest deciding its state: `done`, `failed (<reason>)`, `failed <n> times (<reason>, <reason>), then done` (a step done, then failed on a re-check, then done again, counts its one failure), `declined` (shown as `off` for the schedule), or `not reached`. Add in brackets only what the examples show: the `markitdown` and `gh` settings, the template version (`unknown` when `template_version` is null), `custom agent` or `personal instructions` (from the `prerequisites` line's `custom_agents`), the seeding counts. Step 7 has its own form, below.
- **Step 7:** `passed on attempt <n>` or `unresolved after <n> attempts`, counting its `first-value` lines, then each check from the latest line (`not run` for a check left out, `skip (Tasks off)`). While first value is unresolved, step 8 reads `not offered (first value unresolved)`.
- Without Notion AI, 4a and 4b read `not required (no Notion AI)`.
- Asked before setup is finished, the steps not reached say so, and the Time line counts up to now.

**Never in the report:** a person, org, project, area or document name, a path, a Notion id or URL, an email, the user's words, or an error message as printed (only its code). Before showing it, check the text against the brain's titles and aliases (`brain index --json`) and drop any line that contains one.

## Filing it, after a yes

The product repository is the one named by the `repository` field of `<product.path>/package.json` (a string, or an object with a `url`; take its GitHub `owner/name`).

- **`settings.gh` `on`:** `gh issue create --repo <owner/name> --label beta-setup --title "Setup report: <CLI version>, <agent>" --body-file <a temporary file holding the report>`. Give the user the issue's link. A failure (no network, the label missing): give the text and the link below instead.
- **`gh` off, or no `repository` field:** give the text, ready to copy, and the new-issue link `https://github.com/<owner/name>/issues/new?labels=beta-setup` (with no `repository` field, only the text, and say the report can be sent to whoever invited them).
- **No:** nothing is sent.

At the end of setup (steps 1 to 8 done), after the answer, log `step=finished result=done` and commit `setup: finished`. A report shown while setup is unfinished, first value unresolved included, writes no `finished` line and unlocks nothing. Then say, in two lines: setup is done, and what to do tomorrow ("Mark a meeting Reviewed after it's summarised, then say "catch up".").

## Reason codes

The `reason=` of a `result=failed` line:

| Code | When |
|---|---|
| `missing-prerequisite` | Node, Git or the agent is missing (step 1) |
| `notion-ai-missing` | the plan has no Notion AI and the user didn't choose the path without it (step 1) |
| `notion-unreachable` | no Notion tools in the session, or the MCP call failed |
| `brain-data-not-found` | the search found no Brain Data page |
| `database-missing` | a database of Core or of a module on is still missing after connect |
| `shape-wrong` | the minutes check found the shape wrong |
| `assistant-reads-outside` | `/Today` returned something from outside the brain's databases |
| `remote-failed` | the private remote couldn't be created or found |
| `push-failed` | a push failed |
| `first-value-unresolved` | first value didn't pass: a check `fail`, `unsuitable` or not run yet (step 7) |
| `user-stopped` | the user stopped during a check that had started (a test page made, a test task created) |
| a CLI error code | a `brain` command failed (its `error.code`, such as `INPUT_INVALID`) |
