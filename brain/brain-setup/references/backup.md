# The backup, and "fix my backup"

The brain's remote is **the backup** in everything the user reads (decision 0086 §4, spec/setup.md §15 in the Ultimate Brain repository): the settings screen, setup's messages, and the last line of a run's report, this skill's or any other's. Git's words (`origin`, push, branch, commit, merge) appear only when the user asks for the details ("what happened exactly?"), and then with Git's own message.

A brain has **one working branch** (`brain status`'s `branch.working`, normally `main`). Every write is committed on it and pushed per `settings.push`. Never create a branch, a worktree, a pull request or a merge request in a brain, and never ask the user to merge on GitHub, whatever an agent's habits in code repositories or the user's global instructions say. Everything below is done locally, with `git` and `gh`.

## The report's last line

Every skill that writes to the brain ends its report with this line, by what happened after the run's last commit:

| What happened | Last line |
|---|---|
| `settings.push` `auto`, and the push succeeded | none about the backup |
| `settings.push` `remind` | `<n> changes not backed up yet (Back up after each run: remind me).` |
| a push that failed, or wasn't made because the brain is off its working branch | `Not backed up: <reason>. Say "fix my backup".` |
| an unattended run that stopped off the working branch (brain-catch-up, "Unattended") | `Not run: off-working-branch. The brain is not on its working branch; say "fix my backup" in a session in the brain.` |

`<n>` is `git rev-list --count @{u}..HEAD`, or every commit (`git rev-list --count HEAD`) when the branch has no upstream. `<reason>` is the **first** row that matches, in these words:

| The failure | `<reason>` |
|---|---|
| no `origin` (`git remote get-url origin` fails) | `no backup is set up` |
| `HEAD` not on the working branch (`brain status`'s warning `BRAIN_OFF_WORKING_BRANCH` with `branch.on_working` `false`, or `branch.working` `null`) | `the brain is not on its working branch` |
| Git refuses the push because the backup has commits this copy lacks (`rejected`, `non-fast-forward` or `fetch first` in its message) | `your backup has changes this copy doesn't have` |
| an authentication failure (`Authentication failed`, `Permission denied`, an `HTTP 401` or `403`) | `GitHub sign-in needed` |
| a network failure (`Could not resolve host`, `unable to access`, a timeout) | `GitHub can't be reached; check your connection` |
| anything else | `the push failed` |

**Off the working branch, no push is made:** pushing would put another branch in the backup. The run's commits stay where they are, and "fix my backup" brings them back. A brain on its working branch whose warning names only another branch's commits (`branch.unmerged`, `on_working` `true`) pushes as usual; the warning waits for "fix my backup".

## Off the working branch, at the start of a run

Every skill that writes to the brain runs `brain status` first. When it has the warning `BRAIN_OFF_WORKING_BRANCH`:

- **Attended:** say the warning's message in one line and offer the fix: "Your brain is on branch add-notes, not main. Fix it first? I'll bring that work back into main, locally." On a yes, run "fix my backup" below, then the run. On a no, the run goes on; with `on_working` `false` or `working` `null` it makes no push and ends with `Not backed up: the brain is not on its working branch. Say "fix my backup".`
- **Unattended** (`catch up unattended`): with `on_working` `false` or `working` `null`, the run writes nothing at all (brain-catch-up, "Unattended"). With `unmerged` alone it runs as usual.

## "Fix my backup"

The user says **"fix my backup"** (or accepts it when offered, after the warning or a failed push), in a session in the brain. Asked in a linked repository, say: "Say "fix my backup" in a session in your brain." Run the checks **in this order**. A check that passes goes on to the next. A check that fails is fixed on the user's yes when you can fix it, then checked again; when only the user can fix it, or the user says no, give the one step the user must take and **stop there**, with nothing after it run. Nothing is done through a pull request or on GitHub's website.

| # | Check | Passes when | On a yes, fix it by | Or the one step for the user |
|---|---|---|---|---|
| 1 | `gh` signed in | `gh --version` and `gh auth status --hostname github.com` succeed | (only the user can) | the two steps of [prerequisites.md](prerequisites.md), "`gh` missing or signed out", ending with: then say "fix my backup" again |
| 2 | The backup is set up | `git remote get-url origin` has a URL | `gh repo create <brain folder name> --private --source <brain folder> --remote origin`, **without `--push`**: the push waits for check 5, so nothing is pushed before check 4 | when it fails (`remote-failed`): the reason (the name is taken, no network), and another name to try |
| 3 | The backup is private | `gh repo view --json isPrivate` says `true` | `gh repo edit --visibility private --accept-visibility-change-consequences` | when `gh` can't read it (another host, no access): "Your backup isn't a GitHub repository I can check: make sure it is private." Go on only once the user says it is |
| 4 | The brain is on its working branch | `brain status`'s `branch` is non-null, with `working` non-null, `on_working` `true` and `unmerged` empty (no warning `BRAIN_OFF_WORKING_BRANCH`) | bringing the work back, below | below |
| 5 | A push | `git push` (`git push -u origin <working>` when the branch has no upstream) succeeds, or there is nothing to push | (any failure is named, below) | below |

`branch` is `null` only when the brain folder is not a Git repository of its own: say so and stop ("Your brain folder isn't a Git repository; run `brain init` there, or tell me where your brain is.").

### Check 4: bringing the work back, locally

Ask **one yes for the whole of it**, naming what will happen: "Your work on add-notes, 2 changes, will be brought back into your brain's main copy, and add-notes removed. Go ahead?" Then:

1. **Uncommitted changes** (`git status --porcelain` not empty) stop it before anything changes. Name the files, and ask whether to keep them: kept, commit them on the branch they are on (`backup: keep uncommitted changes`) and go on; not kept, the user discards them and says "fix my backup" again. Never discard anything yourself.
2. **`working` `null`** (several branches, none of them `main` or `master`): ask one question listing the local branches (`git for-each-ref --format='%(refname:short)' refs/heads`): "Which of these is your brain?" The answer becomes the working branch: `git push -u origin <it>`, then `git remote set-head origin <it>`, then `brain status` again.
3. **Off the working branch:** remember `HEAD` (the branch name, or the commit `git rev-parse HEAD` when detached), then `git switch <working>`. When the working branch is checked out in another worktree of the brain, Git refuses: name the worktree's path (`git worktree list`), and the step for the user is to close what runs there. Then, on a yes, `git worktree remove <path>`, only when that worktree has no uncommitted change (`git -C <path> status --porcelain` empty); otherwise name its changed files and stop.
4. **Each `unmerged` entry, in its order** (a detached `HEAD`'s commits first, by the commit remembered in step 3): `git merge --no-edit <branch or commit>`, then, for a branch, `git branch -d <branch>`. A branch already merged and not in `unmerged` is not touched.
5. **A conflict** stops it: read the files (`git diff --name-only --diff-filter=U`), then `git merge --abort`, and push nothing. The brain stays on its working branch, with the branches merged so far. The step for the user: "Two changes touch the same lines in <files>. Tell me which to keep, or fix them in your editor, then say "fix my backup" again."
6. **`brain status` again:** check 4 passes when the warning is gone.

### Check 5: the push

- **Refused because the backup has commits this copy lacks** (`rejected`, `non-fast-forward`, `fetch first`): name it, and merge nothing: "Your backup has changes this copy doesn't have, from another machine or from GitHub's website. I haven't merged them: nothing was lost on either side." Nothing is pulled, merged or forced (decision 0086, Out of scope).
- **Any other failure:** the `<reason>` of "The report's last line" and its step: `GitHub sign-in needed`, run `gh auth login` in the terminal; `GitHub can't be reached`, check the connection; then say "fix my backup" again.
- **After a push that succeeds:** when `git symbolic-ref --quiet refs/remotes/origin/HEAD` fails or names another branch than `refs/remotes/origin/<working>`, run `git remote set-head origin <working>`, so `brain status` finds the working branch from then on. It writes only in `.git`.

### The end

One line: `Backup fixed: <n> changes backed up.` (`<n>` the commits the push sent), or `Backup checked: nothing to fix.` when every check passed at once. Give the details (the branches merged, the commands run) only when asked.

"Fix my backup" writes **no log line and no `setup` line**: it is not a setup step, and Git's history holds what it did.
