# Ultimate Brain Skills

The agent skills behind [Ultimate Brain](https://github.com/superuser-pal/ultimate-brain), published by Sentina.

Ultimate Brain is an AI-assisted second brain for solo knowledge workers. What you know lives as Markdown notes in a Git repository on your computer. A coding agent (Claude Code or Codex) keeps it up to date, and you review and navigate it in Notion. Nothing your brain knows changes without your approval.

The `brain` command does the exact work: it reads and writes notes, checks them, and decides what may be used in an answer. The skills in this repository tell your agent **when and how to use that command**: how to ingest a meeting, how to answer with citations, how to run setup. The command without the skills is a toolbox; the skills are the working method.

## You don't install anything from here

**Setting up a brain? You don't need to clone this repository.** To use Ultimate Brain, follow its [Get started](https://github.com/superuser-pal/ultimate-brain#get-started). The `ultimate-brain` package ships a released copy of these skills and writes them into your brain folder, for Claude Code and for Codex. `brain upgrade` brings a newer copy when you update the package.

## The skills

They are in [`brain/`](brain/), one folder each.

| Skill | For example, you say | What it does |
|---|---|---|
| [brain-setup](brain/brain-setup/SKILL.md) | "set up my brain" | Guides the first setup, once and in order, and picks up where you stopped |
| [brain-connect-notion](brain/brain-connect-notion/SKILL.md) | "connect my Notion" | Connects the brain to your Notion space and checks its databases |
| [brain-catch-up](brain/brain-catch-up/SKILL.md) | "catch up" | Does everything that is waiting in one run: your Notion edits, decided reviews, new meetings, the Inbox, the drop folder |
| [brain-ingest](brain/brain-ingest/SKILL.md) | "ingest this" | Takes in reviewed minutes, documents, web pages, emails and notes, and proposes what to learn from them |
| [brain-apply](brain/brain-apply/SKILL.md) | "apply my reviews" | Applies what you approved, rejected or asked to fix |
| [brain-sync](brain/brain-sync/SKILL.md) | "sync with Notion" | Syncs the brain and your Notion space in both directions |
| [brain-query](brain/brain-query/SKILL.md) | any question | Answers from your brain with citations, and says so when it doesn't know |
| [brain-reflect](brain/brain-reflect/SKILL.md) | "tidy my brain" | Finds contradictions, stale facts, duplicates and missing notes, and proposes fixes |
| [brain-weekly-review](brain/brain-weekly-review/SKILL.md) | "weekly review" | Writes one short weekly report with the decisions that need you |
| [ultimate-assistant](brain/ultimate-assistant/SKILL.md) | "review my work" | Reviews your Areas, Projects and Tasks and recommends changes |
| [brain-repos](brain/brain-repos/SKILL.md) | "link this repo" | Links another Git repository to the brain, and shows, changes or removes a link |
| [brain-workflow](brain/brain-workflow/SKILL.md) | "track this work" | Tracks the work in a folder, on its own or connected to a Notion Project |
| [brain-workflow-adopt](brain/brain-workflow-adopt/SKILL.md) | "adopt this project" | Takes an existing project's plans and tasks into a connected workflow |
| [brain-notion-change](brain/brain-notion-change/SKILL.md) | "change my Notion space" | Changes the structure of your Notion space the safe way |
| [brain-howto](brain/brain-howto/SKILL.md) | "how do I…" | Explains how your brain works, from the user guide |

A repository you link to your brain gets three of them (brain-query, brain-workflow and brain-workflow-adopt), so your agent can ask the brain from there.

## Versions

Each release is a tag `brain-v<version>` and a GitHub release holding one snapshot of `brain/`. A snapshot names the range of `ultimate-brain` versions it works with, and the package refuses one outside it. Your brain records the version it runs in `skills.lock.json`. How the skills are written and released: [BRAIN-SKILLS.md](BRAIN-SKILLS.md).

## The general skills

This repository began as a copy of [mattpocock/skills](https://github.com/mattpocock/skills), and still carries his general engineering and productivity skills, unchanged, under [`skills/`](skills/): see [engineering](skills/engineering/README.md), [productivity](skills/productivity/README.md), [misc](skills/misc/README.md), [in-progress](skills/in-progress/README.md) and [deprecated](skills/deprecated/README.md). They are kept in step with his repository and are **not** part of what a brain installs. To use them, install them from [his repository](https://github.com/mattpocock/skills), where they are maintained and documented.

## Something is wrong, or you have a question

Open an issue on the [Ultimate Brain repository](https://github.com/superuser-pal/ultimate-brain/issues/new/choose). Issues are public, so paste no notes, client names, Notion links or tokens. For a security problem, see its [SECURITY.md](https://github.com/superuser-pal/ultimate-brain/blob/main/SECURITY.md). More in [CONTRIBUTING.md](CONTRIBUTING.md).

## Credits and licence

MIT, see [LICENSE](LICENSE). This repository is derived from [mattpocock/skills](https://github.com/mattpocock/skills) by Matt Pocock, with its full history, and is not affiliated with or endorsed by him. [NOTICE.md](NOTICE.md) says which files are his and which are this repository's, and credits the third-party skill it carries.
