# Step 1: prerequisites, all at once

Check everything at once, show one list, and ask the one thing no command can read: the Notion plan.

| Prerequisite | How to check | Required |
|---|---|---|
| Node 22.6 or later | `node --version` | yes |
| Git | `git --version` | yes |
| A Git identity | `git config user.name` and `git config user.email`, run in the brain folder | yes, but set on the next screen when missing |
| Claude Code or Codex | the agent running this skill; note its name for the setup report | yes |
| The Notion MCP connection | a Notion tool is available in this session | yes, but connected in step 3 when missing |
| `gh`, signed in | `gh --version`, then `gh auth status --hostname github.com` | yes, for early access: it creates the backup (decision 0086) |
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

- **A missing required prerequisite that no later step sets** (Node older than 22.6, no Git, an agent other than Claude Code or Codex; `gh` and Notion AI below) stops setup with its fix, a link or one command, never a path under `npm root -g`:
  - Node: "Install Node 22.6 or later from https://nodejs.org, then say "set up my brain" again."
  - Git: "Install Git from https://git-scm.com/downloads, then say "set up my brain" again."
  - Agent: "Open Claude Code or Codex in your brain folder and say "set up my brain" there."

  Log `step=prerequisites result=failed reason=missing-prerequisite`, and stop.
- **`gh` missing or signed out** stops setup at step 1, after the list. `gh --version` fails: reason `gh-missing`. `gh auth status --hostname github.com` exits non-zero: reason `gh-signed-out`. Only github.com is checked, so a broken sign-in to another host doesn't stop setup. Choose the first step's command by the platform: `brew install gh` on macOS (`darwin`), the link on any other. Say:

  ```text
  Setup needs the GitHub CLI (gh), signed in, to create your backup. Two steps:
  1. Install it: brew install gh
     (not on a Mac: follow https://cli.github.com)
  2. In your terminal, run: gh auth login
     When it asks, choose to let it set up Git's credentials.
  Then say "set up my brain" again.
  ```

  On another platform, step 1 reads `1. Install it: follow https://cli.github.com`. With `gh` installed but signed out, leave step 1 out and number step 2 as 1 ("Setup needs the GitHub CLI (gh), signed in, to create your backup. One step:"). Log `step=prerequisites result=failed reason=gh-missing` (or `reason=gh-signed-out`), and stop. Asked again, step 1's checks run again, and setup goes on once `gh auth status --hostname github.com` passes. Offer no other way to make the backup: the manual steps for another Git host are 1.0's (references/settings.md).
- **Notion AI: yes.** Log `step=prerequisites result=done notion_ai=yes custom_agents=<yes|no>` with the user's Custom Agents answer, and go on to step 2. Custom Agents decides how Brain Assistant is set up in step 4b (a Custom Agent, or personal Instructions).
- **Notion AI: no.** Say: "Early access needs Notion AI: the minutes and Brain Assistant run on it. You can add Notion AI to your plan and say "set up my brain" again. There is also a path without it, which becomes supported at 1.0; it drops the structured minutes and Brain Assistant. Add Notion AI, or set up without it?"
  - "Add it" (or no choice): log `step=prerequisites result=failed reason=notion-ai-missing`, and stop.
  - "Without it": log `step=prerequisites result=done notion_ai=no custom_agents=no`, and go on with SKILL.md's "Without Notion AI".
- **Unsure about the plan:** "Your plan is in Notion's settings, or ask your workspace's admin." Wait for the answer; log nothing until then.
