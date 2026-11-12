# Step 1: prerequisites, all at once

Check everything at once, show one list, and ask the one thing no command can read: the Notion plan.

| Prerequisite | How to check | Required |
|---|---|---|
| Node 22.6 or later | `node --version` | yes |
| Git | `git --version` | yes |
| A Git identity | `git config user.name` and `git config user.email`, run in the brain folder | yes, but set on the next screen when missing |
| Claude Code or Codex | the agent running this skill; note its name for the setup report | yes |
| The Notion MCP connection | a Notion tool is available in this session | yes, but connected in step 3 when missing |
| `gh` | `gh --version`, then `gh auth status` | no: the settings screen's `gh` item |
| MarkItDown | `markitdown --version` | no: the settings screen's MarkItDown item |
| The Notion plan | asked: "Does your Notion plan include Notion AI? And Custom Agents?" | Notion AI: yes, for early access |

Show the results as one list, then the question:

```text
Before we start, here is what your machine has:
✓ Node 22.11
✓ Git 2.47
✗ Git identity: set on the next screen
✓ Agent: Claude Code
✗ Notion connection: set up in step 3
✓ gh, signed in
✗ MarkItDown: optional, on the next screen
? Notion AI: asked below

Does your Notion plan include Notion AI? And Custom Agents (Business or Enterprise plans)?
```

## What the answers decide

- **A missing required prerequisite that no later step sets** (Node older than 22.6, no Git, an agent other than Claude Code or Codex) stops setup with its fix, a link or one command, never a path under `npm root -g`:
  - Node: "Install Node 22.6 or later from https://nodejs.org, then say "set up my brain" again."
  - Git: "Install Git from https://git-scm.com/downloads, then say "set up my brain" again."
  - Agent: "Open Claude Code or Codex in your brain folder and say "set up my brain" there."

  Log `step=prerequisites result=failed reason=missing-prerequisite`, and stop.
- **Notion AI: yes.** Log `step=prerequisites result=done notion_ai=yes custom_agents=<yes|no>` with the user's Custom Agents answer, and go on to step 2. Custom Agents decides how Brain Assistant is set up in step 4b (a Custom Agent, or personal Instructions).
- **Notion AI: no.** Say: "Early access needs Notion AI: the minutes and Brain Assistant run on it. You can add Notion AI to your plan and say "set up my brain" again. There is also a path without it, which becomes supported at 1.0; it drops the structured minutes and Brain Assistant. Add Notion AI, or set up without it?"
  - "Add it" (or no choice): log `step=prerequisites result=failed reason=notion-ai-missing`, and stop.
  - "Without it": log `step=prerequisites result=done notion_ai=no custom_agents=no`, and go on with SKILL.md's "Without Notion AI".
- **Unsure about the plan:** "Your plan is in Notion's settings, or ask your workspace's admin." Wait for the answer; log nothing until then.
