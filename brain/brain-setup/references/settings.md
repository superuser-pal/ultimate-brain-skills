# Step 2: the settings screen

One screen, every item with its default filled in and a one-line explanation. The user answers once: "keep these", or changes ("drop folder ~/Inbox/brain", "push: remind", "identity: this repo only"). Show the screen again with the changes, and apply it only on a yes.

## The defaults

| # | Item | Default filled in | Required |
|---|---|---|---|
| 1 | Brain folder | the folder of this brain (shown, not changed here) | shown |
| 2 | Git identity | the current `user.name` and `user.email` in the brain folder; else the owner name from `brain.json` and an empty email, which the user must fill. Scope: all your repositories (global), or this repository only | required |
| 3 | Private remote | the current `origin` when there is one; else, with `gh` signed in, a new private repository named after the brain folder, created for the user; else the steps to create one on their Git host | required |
| 4 | Drop folder | the current `Drop folder:` line; else `~/Documents/brain-dropbox/`, created | required |
| 5 | Language notes are written in | the current `Language:` line; else the language the user writes to you in | required |
| 6 | Modules | the brain's current `modules` (a new brain: Knowledge, Orgs, Documents, Reports, Tasks on; Planning off); Domains is decided by seeding | shown |
| 7 | Publish | `settings.publish` (default `ask`) | shown |
| 8 | Push | `settings.push` (default `auto`) | shown |
| 9 | Opening recall in linked repos | `settings.recall` (default `off`) | shown |
| 10 | MarkItDown | `settings.markitdown` when set; else `on` when `markitdown --version` works, else `off` | optional |
| 11 | `gh` | `settings.gh` when set; else `on` when `gh auth status` passes, else `off` | optional |
| 12 | Scheduled catch-up | asked after the first-value check (step 8) | optional |

## The screen

```text
Your brain's settings. Say "keep these", or change any line ("drop folder ~/Inbox/brain", "push: remind").

 1. Brain folder: ~/brain
    Your brain: Markdown notes in a Git repository. Everything the brain knows is here.
 2. Git identity: Sam Rivera <sam@studio.example>, for all your repositories
    Every change the brain makes is a commit with this name; without it nothing is saved.
 3. Private remote: a new private GitHub repository "brain", created for you
    A private copy of your brain, so nothing is lost and another machine can use it.
 4. Drop folder: ~/Documents/brain-dropbox/ (created)
    Files you drop here are read by the next catch-up: documents, exports, notes.
 5. Language of your notes: English
    The brain writes its notes in this language, whatever the language of the source.
 6. Modules: Knowledge, Orgs, Documents, Reports, Tasks on · Planning off · Domains: decided when we seed your work
    Which parts of your Notion space the brain uses; you can change this any time.
 7. Publish: ask
    Ask before the brain publishes to Notion, or publish after each run (auto).
 8. Push: auto
    Push your brain to its remote after each run, or remind you (remind).
 9. Opening recall in linked repos: off
    Agents in your linked repos load what the brain remembers about them when a session opens.
10. MarkItDown: off (not installed)
    Turns PDFs, Word files and slides into exact text, so quotes are exact; off, the agent reads files itself.
11. gh: on
    Lets setup create the private remote and file your setup report for you.
12. Scheduled catch-up: asked after your first check
    Catch-up runs on its own at set times; it only takes in what you've marked ready.

Still to do after this screen:
 - Duplicate the Notion template and connect your agent to Notion
 - Connect the brain to its Notion databases
 - Paste the minutes prompt, and check it
 - Set up Brain Assistant, and check it
 - Say which names you appear under
 - Describe your work, so the brain starts with it
 - Check the first results
```

- Show the remote as it will be once created, and where the brain lives (the folder, and the remote once there is one). Without `gh`, item 3 reads: `Private remote: an empty private repository you create on your Git host (GitHub, GitLab…); I'll give you the steps`.
- An item the user can't leave empty (an email, a language) is asked for before the yes: "Item 2 needs your email."
- MarkItDown `on` while it isn't installed: give its install command (`pipx install 'markitdown[all]'`, or `pip install 'markitdown[all]'`) and check `markitdown --version` again before applying.
- `gh` `on` while `gh auth status` fails: "Run `gh auth login` in your terminal, then say "done"." Check again before applying.
- Without Notion AI (SKILL.md), add under the screen what is lost, and leave the minutes prompt and Brain Assistant out of "Still to do".

## Applying it, after the yes

In this order; a failure stops the step with its fix, and logs `step=settings result=failed reason=<code>`.

1. **Git identity.** `git config --global user.name "<name>"` and `user.email`, or without `--global` in the brain folder when the user chose "this repository only".
2. **The remote,** when the brain has no `origin`:
   - `gh` on: `gh repo create <name> --private --source <brain folder> --push`. A failure (the name is taken, no network): reason `remote-failed`; offer another name, or the steps below.
   - `gh` off: give the steps for the user's Git host: create an empty private repository (no README), copy the URL the host shows for it (`https:` or `ssh`), then, in the brain folder, `git remote add origin <that URL>` and `git push -u origin HEAD`. Wait for "done", then check that `git remote get-url origin` has a URL and `git ls-remote origin` lists the branch. No URL, or nothing pushed: reason `remote-failed`, say which, and stop.
3. **The drop folder:** create it (`mkdir -p`, with `~` expanded).
4. **The two `AGENTS.md` lines** (below).
5. **Settings:** `brain config set settings.<key> '"<value>"'` for `publish`, `push`, `recall`, `markitdown` and `gh`, each one the screen shows, whether changed or not, so the choice is recorded. `settings.schedule` waits for step 8.
6. **Modules:** `brain modules on|off <module>` for each change.
7. **Check** with `brain status`: `checks` `git_identity`, `remote`, `drop_folder` and `language` must pass. One that doesn't is fixed now.
8. **Log, commit and push:** commit `rules: drop folder and language` for the `AGENTS.md` lines, on their own; log `step=settings result=done`; commit `setup: settings` with `brain.json` and the `setup` log lines not yet committed (`started`, `prerequisites`, this one); `git push -u origin HEAD` (the brain's branch may be `main` or `master`).

## The `AGENTS.md` lines

`Drop folder: <path>` and `Language: <name>` go under the `## My rules` heading, which follows the rules block's end marker `<!-- ultimate-brain:rules:end -->`. Upgrades never touch anything after that marker.

- Each line on its own, after the heading's comment.
- An earlier line of the same name anywhere after the marker is replaced, not duplicated.
- The heading missing: add `## My rules` at the end of the file first.
- **The rules block's markers missing** (no `<!-- ultimate-brain:rules:start` line or no `<!-- ultimate-brain:rules:end -->` line, or out of order): write nothing. Say: "Your AGENTS.md has lost the markers around the brain's rules, so I can't tell where your own rules start. Run `brain upgrade`, or restore the markers by hand, then say "set up my brain" again." Setup stops at step 2.
- Edit only these lines; the rest of the user's rules stay byte for byte.

## Changing one setting later

Asked outside the screen ("turn on markitdown", "turn off gh", "change my drop folder"): apply that item alone as above (its install or sign-in check first), commit `setup: <item>`, and say what it changes. An optional item set to `off` is never asked again; this is how the user changes it.
