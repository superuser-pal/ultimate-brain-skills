# Step 2: the settings screen

One screen, every item with its default filled in and a one-line explanation. The user answers once: "keep these", or changes ("drop folder ~/Inbox/brain", "back up: remind me", "identity: this repo only"). Show the screen again with the changes, and apply it only on a yes.

What the user reads calls the remote **the backup** and uses no Git word (decision 0086 §4, [backup.md](backup.md)): items 3 and 8 give the words. Git's own words (`origin`, push, branch) appear only when the user asks for the details.

## The defaults

| # | Item | Default filled in | Required |
|---|---|---|---|
| 1 | Brain folder | the folder of this brain (shown, not changed here) | shown |
| 2 | Git identity | the current `user.name` and `user.email` in the brain folder; else the owner name from `brain.json` and an empty email, which the user must fill. Scope: all your repositories (global), or this repository only | required |
| 3 | Backup | the current `origin` when there is one; else a new private GitHub repository named after the brain folder, created with `gh` (step 1 checked it is signed in) | required |
| 4 | Drop folder | the current `Drop folder:` line; else `~/Documents/brain-dropbox/`, created | required |
| 5 | Language notes are written in | the current `Language:` line; else the language the user writes to you in | required |
| 6 | Modules | the brain's current `modules` (a new brain: Knowledge, Orgs, Documents, Reports, Tasks on; Planning off); Domains is decided by seeding | shown |
| 7 | Publish | `settings.publish` (default `ask`) | shown |
| 8 | Back up after each run | `settings.push` (default `auto`, shown as `on`; `remind` is shown as `remind me`) | shown |
| 9 | Opening recall in linked repos | `settings.recall` (default `off`) | shown |
| 10 | MarkItDown | `settings.markitdown` when set; else `on` when `markitdown --version` works, else `off` | optional |
| 11 | GitHub CLI (`gh`) | `on`: step 1 checked it is signed in | required for early access: shown, not changed |
| 12 | Scheduled catch-up | asked after the first-value check (step 8) | optional |
| 13 | How the brain talks to you | the current `settings.style` (below); absent: Standard | optional |

## The screen

```text
Your brain's settings. Say "keep these", or change any line ("drop folder ~/Inbox/brain", "back up: remind me").

 1. Brain folder: ~/brain
    Your brain: Markdown notes in a Git repository. Everything the brain knows is here.
 2. Git identity: Sam Rivera <sam@studio.example>, for all your repositories
    Every change the brain makes is a commit with this name; without it nothing is saved.
 3. Backup: a private GitHub repository, created for you
    A private copy of your brain on GitHub, so nothing is lost and another machine can use it.
 4. Drop folder: ~/Documents/brain-dropbox/ (created)
    Files you drop here are read by the next catch-up: documents, exports, notes.
 5. Language of your notes: English
    The brain writes its notes in this language, whatever the language of the source.
 6. Modules: Knowledge, Orgs, Documents, Reports, Tasks on · Planning off · Domains: decided when we seed your work
    Which parts of your Notion space the brain uses; you can change this any time.
 7. Publish: ask
    Ask before the brain publishes to Notion, or publish after each run (auto).
 8. Back up after each run: on
    Back up your brain after each run, or remind you to.
 9. Opening recall in linked repos: off
    Agents in your linked repos load what the brain remembers about them when a session opens.
10. MarkItDown: off (not installed)
    Turns PDFs, Word files and slides into exact text, so quotes are exact; off, the agent reads files itself.
11. GitHub CLI (gh): on
    Creates your backup, checks it stays private, and files your setup report for you.
12. Scheduled catch-up: asked after your first check
    Catch-up runs on its own at set times; it only takes in what you've marked ready.
13. How the brain talks to you: Standard
    Standard, Simple (plain words, short answers, the answer first) or Custom (you choose how much it explains, how long and how direct it is); change it any time by asking.

Still to do after this screen:
 - Duplicate the Notion template and connect your agent to Notion
 - Connect the brain to its Notion databases
 - Paste the minutes prompt, and check it
 - Set up Brain Assistant, and check it
 - Say which names you appear under
 - Describe your work, so the brain starts with it
 - Check the first results
```

- Show where the brain lives: the folder, and the backup once there is one (`Backup: the private GitHub repository you already have`, when `origin` is set). Item 3 never offers another Git host in early access.
- Item 8 is changed with the words shown ("back up: remind me", "back up: on"); the setting keeps its values `auto` and `remind`.
- Item 11 is not a choice in early access: asked to turn it off, say "Early access needs the GitHub CLI: it keeps your backup working." and write nothing.
- An item the user can't leave empty (an email, a language) is asked for before the yes: "Item 2 needs your email."
- MarkItDown `on` while it isn't installed: give its install command (`pipx install 'markitdown[all]'`, or `pip install 'markitdown[all]'`) and check `markitdown --version` again before applying.
- Without Notion AI (SKILL.md), add under the screen what is lost, and leave the minutes prompt and Brain Assistant out of "Still to do".

## Item 13: how the brain talks to you

The response style (decision 0081, spec/setup.md §7). It shapes only what you write in your own words; text a command returns that a skill shows exactly as returned stays as it is.

- **What the line shows:** read `brain status`'s `settings.style` (its `preset` and each dial's effective value). The preset's name when every dial has the preset's value (`Standard`, `Simple`); else `Custom:` and the three values in words (`Custom: plain words, short answers, the answer first`). A new brain has no `settings.style`, so the line shows `Standard`.
- **Standard is the default.** "Keep these" keeps the line as shown. Nothing is written for this item before the user's yes to the whole screen; a setup stopped before that yes writes no `settings.style`.
- **Custom** ("style: custom"): before showing the screen again, ask the three dials in one message, each with its levels and what it changes, Standard's level first:

  ```text
  Choose one level for each, or say "keep" for the first:
   - Explaining: some (a new term is defined once) · expert (no terms defined) · plain (no jargon, and an example for each term)
   - Length: normal · short (at most five items at a time, "more" shows the rest) · full (the details and the reasons)
   - What comes first: context first · the answer first (and "step 3 of 5" in work with several steps)
  ```

  The screen shown again has the three choices on the item's line.
- **The value written,** in "Applying it" step 5: Standard `'{ "preset": "standard" }'`, Simple `'{ "preset": "simple" }'`, Custom the three dials with no preset (`'{ "explain": "plain", "length": "normal", "directness": "answer-first" }'`).
- **From the next message of the setup,** answer in the new style: the brain's `AGENTS.md` now has it (or, for Standard, no longer has a style block).

## Changing the response style

The user asks in their own words, in any session in the brain: "talk to me more simply", "shorter answers", "more detail", "skip the jargon", "get to the point", "go back to normal". This is not a setup step: it writes no `setup` log line, and it works whether or not setup has finished (spec/setup.md §7.1).

1. **Map the request to one write,** with `brain config set` (it rewrites the style block in `AGENTS.md` and reports it in `files`):

   | Asked | Write |
   |---|---|
   | the whole style: "talk to me more simply", "simple mode" | `brain config set settings.style '{ "preset": "simple" }'` |
   | back to the default: "go back to normal", "use Standard", "talk to me as before" | `brain config set settings.style '{ "preset": "standard" }'` |
   | how much it explains: "skip the jargon", "explain more" · "you don't need to explain terms" · "explain like before" | `settings.style.explain` `'"plain"'` · `'"expert"'` · `'"some"'` |
   | length: "shorter answers" · "more detail", "longer answers" · "normal length" | `settings.style.length` `'"short"'` · `'"full"'` · `'"normal"'` |
   | what comes first: "get to the point", "answer first" · "give me the context first" | `settings.style.directness` `'"answer-first"'` · `'"context-first"'` |

   A whole-style write clears every dial set before; a dial write keeps the other keys. A request that maps to none of these, or to two that pull apart ("simpler but more detail"), gets one question naming the choices, and nothing is written before the answer.
2. **Read `files`:** `AGENTS.md` `skipped` (warning `AGENTS_BLOCK_NOT_FOUND`) means the setting is saved but the brain's instructions don't show it: say "Saved, but your AGENTS.md has lost its markers, so the brain can't follow it yet. Run `brain upgrade` to restore them." and go on to commit.
3. **Commit** `brain.json` and `AGENTS.md` when they changed, as `settings: response style`, then push per `settings.push`.
4. **Answer in one line, in the new style:** what changed ("From now on: plain words, short answers, the answer first."). When `brain status` lists `repos`, or the user has linked a folder with `brain link` (the brain keeps no list of those, so add it when unsure), add: `Linked folders follow the next time brain link runs there, or brain upgrade for a linked project registered in the brain.`

The working principles and reply rules in the rules block are not part of the style and don't change with it.

## Applying it, after the yes

In this order; a failure stops the step with its fix, and logs `step=settings result=failed reason=<code>`.

1. **Git identity.** `git config --global user.name "<name>"` and `user.email`, or without `--global` in the brain folder when the user chose "this repository only".
2. **The backup** (decision 0086 §3), always with `gh`, on the brain's working branch (`brain status`'s `branch.working`; a new brain has one branch):
   - **No `origin`:** `gh repo create <brain folder name> --private --source <brain folder> --push`. A failure (the name is taken, no network): reason `remote-failed`; say which, offer another name, and stop at step 2 until it succeeds.
   - **An `origin` already set** is kept, and nothing is created.
   - **The privacy check,** before anything more is pushed: `gh repo view --json isPrivate` must say `true`. `false`: reason `remote-public`; say "Your backup is a public repository. Make it private? I'll run `gh repo edit --visibility private --accept-visibility-change-consequences`." On a yes, run it and check again; on a no, stop at step 2. An `origin` that `gh` can't read (another host, no access): reason `remote-failed`, and stop: another host is 1.0's path.
3. **The drop folder:** create it (`mkdir -p`, with `~` expanded).
4. **The two `AGENTS.md` lines** (below).
5. **Settings:** `brain config set settings.<key> '"<value>"'` for `publish`, `push`, `recall`, `markitdown` and `gh` (always `on`), each one the screen shows, whether changed or not, so the choice is recorded, then `brain config set settings.style '<value>'` for item 13 ("Item 13" above), which also writes the style block in `AGENTS.md`. `settings.schedule` waits for step 8.
6. **Modules:** `brain modules on|off <module>` for each change.
7. **Check** with `brain status`: `checks` `git_identity`, `remote`, `drop_folder` and `language` must pass. One that doesn't is fixed now.
8. **Log, commit and push:** commit `rules: drop folder and language` for the `AGENTS.md` lines, on their own (with the style block too when step 5 changed it: `rules: drop folder, language and response style`); log `step=settings result=done`; commit `setup: settings` with `brain.json` and the `setup` log lines not yet committed (`started`, `prerequisites`, this one); then `git push -u origin <working branch>`, which creates `origin/<working branch>`, and after it succeeds `git remote set-head origin <working branch>`, so `brain status` finds the working branch from `origin/HEAD` from then on (it writes only in `.git`). A failed push is reported with [backup.md](backup.md)'s words ("Not backed up: <reason>. Say "fix my backup".") and reason `push-failed`; setup goes on.

## The `AGENTS.md` lines

`Drop folder: <path>` and `Language: <name>` go under the `## My rules` heading, which follows the rules block's end marker `<!-- ultimate-brain:rules:end -->`. Upgrades never touch anything after that marker.

- Each line on its own, after the heading's comment.
- An earlier line of the same name anywhere after the marker is replaced, not duplicated.
- The heading missing: add `## My rules` at the end of the file first.
- **The rules block's markers missing** (no `<!-- ultimate-brain:rules:start` line or no `<!-- ultimate-brain:rules:end -->` line, or out of order): write nothing. Say: "Your AGENTS.md has lost the markers around the brain's rules, so I can't tell where your own rules start. Run `brain upgrade`, or restore the markers by hand, then say "set up my brain" again." Setup stops at step 2.
- Edit only these lines; the rest of the user's rules stay byte for byte.

## Another Git host (1.0's path, not offered in early access)

Decision 0086 §3 keeps these steps written for 1.0, whose opening grill decides how `gh` becomes optional again. Don't offer them before then: create an empty private repository (no README) on the host; copy the URL it shows (`https:` or `ssh`); in the brain folder, `git remote add origin <that URL>` and `git push -u origin HEAD`, which also needs a token or an SSH key for the host; then check that `git remote get-url origin` has a URL and `git ls-remote origin` lists the branch, else reason `remote-failed`.

## Changing one setting later

Asked outside the screen ("turn on markitdown", "back up: remind me", "change my drop folder"): apply that item alone as above (its install check first), commit `setup: <item>`, and say what it changes. An optional item set to `off` is never asked again; this is how the user changes it. "Turn off gh" is answered as item 11 says, and nothing is written.
