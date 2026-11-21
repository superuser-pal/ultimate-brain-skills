# Step 1: prerequisites, all at once

Check everything at once, show one list, and ask the two things no command can read: the Notion plan, and where the user's meetings come from (spec/setup.md §13, decision 0101 §7 and §8).

| Prerequisite | How to check | Required |
|---|---|---|
| Node 22.6 or later | `node --version` | yes |
| Git | `git --version` | yes |
| A Git identity | `git config user.name` and `git config user.email`, run in the brain folder | yes, but set on the next screen when missing |
| Claude Code or Codex | the agent running this skill; note its name for the setup report | yes |
| The Notion MCP connection | a Notion tool is available in this session | yes, but connected in step 3 when missing |
| `gh`, signed in | `gh --version`, then `gh auth status --hostname github.com` | yes, for early access: it creates the backup (decision 0086) |
| Python and MarkItDown | `markitdown --version`; when it fails, `python3 --version` (`py --version` on Windows) and `pipx --version` (`py -m pipx --version` on Windows), only to choose the message's steps | yes, for early access: it turns documents into exact text (decision 0097) |
| Notion credits, and the meetings | asked, the two questions below | no: each answer only decides whether step 4a or 4b is taken |

Show the results as one list, then the question:

```text
Before we start, here is what your machine has:
✓ Node 22.11
✓ Git 2.47
✗ Git identity: set on the next screen
✓ Agent: Claude Code
✗ Notion connection: set up in step 3
✓ gh, signed in
✓ MarkItDown
? Notion credits and your meetings: asked below

Do you have Notion's Business or Enterprise plan with Notion credits? (yes / no / not sure)
Notion's page on credits: <the link>
```

Ask the second question once the first is answered, as its own message:

```text
Where do your meeting transcripts come from? Pick all that apply:
1. Notion AI meeting notes
2. Another tool that writes into your Meetings (Granola, Fireflies, an automation)
3. You paste a transcript or minutes on a meeting page
4. Files you put in your drop folder
```

`<the link>` is the Notion help page on credits that the template's Start here callout links: take it from `<product.path>/docs/notion-space-design.md` (the Start here callout's "Notion credits" link, §10), never from memory.

## What the answers decide

- **The platform** is the one this agent runs on: `darwin` (macOS), `win32` (Windows) or another. Give the commands of "Install commands" below for it, exactly as written, one per line; another platform gets the links.
- **Fix everything missing in one message,** in the table's order below, so the user installs once and restarts once; end it with the restart line. Never edit the user's `PATH` or shell profile yourself.
- **A missing required prerequisite that no later step sets** (Node older than 22.6, no Git, an agent other than Claude Code or Codex; `gh` and MarkItDown below) stops setup with its fix, never a path under `npm root -g`:
  - Node: "Install Node 22.6 or later: <Node's command>."
  - Git: "Install Git: <Git's command>."
  - Agent: "Open Claude Code or Codex in your brain folder and say "set up my brain" there."

  Log `step=prerequisites result=failed reason=missing-prerequisite`, and stop.
- **`gh` missing or signed out** stops setup at step 1, after the list. `gh --version` fails: reason `gh-missing`. `gh auth status --hostname github.com` exits non-zero: reason `gh-signed-out`. Only github.com is checked, so a broken sign-in to another host doesn't stop setup. Say (shown for macOS):

  ```text
  Setup needs the GitHub CLI (gh), signed in, to create your backup. Two steps:
  1. Install it: brew install gh
  2. In your terminal, run: gh auth login
     When it asks, choose to let it set up Git's credentials.
  Open a new terminal window, then say "set up my brain" again.
  ```

  Step 1's command is `gh`'s for the platform: `winget install --id GitHub.cli -e` on Windows, `follow https://cli.github.com` on another platform. With `gh` installed but signed out, leave step 1 out, number step 2 as 1 ("Setup needs the GitHub CLI (gh), signed in, to create your backup. One step:") and end with "Then say "set up my brain" again." Log `step=prerequisites result=failed reason=gh-missing` (or `reason=gh-signed-out`), and stop. Asked again, step 1's checks run again, and setup goes on once `gh auth status --hostname github.com` passes. Offer no other way to make the backup: the manual steps for another Git host are 1.0's (references/settings.md).
- **MarkItDown missing** (`markitdown --version` fails) stops setup at step 1. Leave out the Python step when Python was found and the `pipx` step when `pipx` was found, and renumber. Say (shown for Windows):

  ```text
  Setup needs MarkItDown, which turns PDFs, Word files and slides into exact text, so the brain quotes them exactly.
  1. Install Python: winget install --id Python.Python.3.12 -e
  2. Install pipx: py -m pip install --user pipx
  3. Install MarkItDown:
     py -m pipx install "markitdown[all]"
     py -m pipx ensurepath
  Close every terminal, quit Claude Code and open it again (closing its terminal is not enough), then say "set up my brain" again.
  ```

  Name the agent you are ("quit Codex"). Log `step=prerequisites result=failed reason=markitdown-missing`, and stop; asked again, setup goes on once `markitdown --version` passes. With `gh` missing too, one message holds both, `gh` first, with one restart line at the end.
- **The restart line** ends every message that asks for an install. A terminal or an agent app keeps the `PATH` it started with, so a tool installed after it opened isn't found:
  - Windows: "Close every terminal, quit <your agent> and open it again (closing its terminal is not enough), then say "set up my brain" again."
  - macOS: "Open a new terminal window, then say "set up my brain" again."

  A tool still not found after that: point to the guide's "A command isn't found on Windows" (docs/setup.md); the reason code stays the prerequisite's.

- **The two answers** (spec/setup.md §13). Neither stops setup: each only decides which steps are taken.
  - **Credits:** yes, no, or not sure. "Not sure" is answered as no: say "Check under Settings → Billing in Notion. If you have credits later, say "ask me the setup questions again"." and go on.
  - **Meetings:** one or more of `notion-ai` (1), `tool` (2), `paste` (3), `files` (4). All four are offered whatever the plan: a Business plan without credits still has Notion AI meeting notes. Nothing checks the answer here: step 4a's check does.
  - Log `step=prerequisites result=done credits=<yes|no> meetings=<list>`, the list in that order joined by commas (`meetings=notion-ai,files`), and go on to step 2. Nothing else records the answers: no `brain.json` key, no Notion change. SKILL.md, "The two answers", says what each one installs or leaves out.
- **A brain whose latest `prerequisites` line is from before 0.17.0** (it has `notion_ai` and no `credits`) keeps it: `brain status` reads it as before (7 required items with `notion_ai=no`, else 9). Ask the two questions only when step 1 runs again, or when the user says "ask me the setup questions again"; the new line then counts.

### Install commands

| Prerequisite | macOS | Windows (PowerShell) | Another platform |
|---|---|---|---|
| Homebrew (only when `brew --version` fails and a `brew` command is needed) | `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`, then the lines it prints under "Next steps" | | |
| Node | `brew install node` | `winget install --id OpenJS.NodeJS.LTS -e` | https://nodejs.org |
| Git | `xcode-select --install` (Apple's developer tools: a window opens, and the download takes several minutes) | `winget install --id Git.Git -e` | https://git-scm.com/downloads |
| `gh` | `brew install gh` | `winget install --id GitHub.cli -e` | https://cli.github.com |
| Python | `brew install python` | `winget install --id Python.Python.3.12 -e` | https://www.python.org/downloads |
| `pipx` (only when `pipx --version` fails) | `brew install pipx` | `py -m pip install --user pipx` | https://pipx.pypa.io |
| MarkItDown | `pipx install 'markitdown[all]'`, then `pipx ensurepath` | `py -m pipx install "markitdown[all]"`, then `py -m pipx ensurepath` | https://github.com/microsoft/markitdown |

On Windows, when `winget --version` fails (an old Windows 10), give the links instead, and say to update "App Installer" from the Microsoft Store to get `winget`.
