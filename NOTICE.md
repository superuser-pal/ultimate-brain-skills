# Notice

ultimate-brain-skills is derived from [mattpocock/skills](https://github.com/mattpocock/skills), with its full Git history, under the MIT licence in [LICENSE](LICENSE). The upstream commit last merged is recorded in [upstream.json](upstream.json). It holds the agent skills of Ultimate Brain: the operational `brain-*` skills each brain pins, and general skills.

## Telling local additions from upstream content

The path says which is which. Upstream content stays at upstream's paths, and upstream changes arrive only through upstream-sync PRs. Everything listed here is local to this fork:

| Path | What it is |
|---|---|
| `brain/` | The operational skills, released as snapshots (tags `brain-v<version>`) |
| `tools/` | Build, check, release and upstream-sync tooling, with its tests |
| `schemas/` | A copy of Ultimate Brain's `spec/schemas/skills-snapshot.schema.json` |
| `.github/` | This fork's workflows and PR template. Upstream's `.github/` is never merged in, so upstream workflows don't run here |
| `NOTICE.md`, `BRAIN-SKILLS.md`, `upstream.json`, `snapshot.config.json`, `.gitattributes` | This file, how the operational skills are written and released ([BRAIN-SKILLS.md](BRAIN-SKILLS.md)), the recorded upstream base, the next snapshot's CLI range and linked-repo skills, and byte-exact checkouts |
| The last paragraph of `LICENSE` | The licence line for these additions. The rest of `LICENSE` is upstream's, verbatim |

A general skill this fork adds lives in a folder upstream doesn't use, and is listed in this table when it's added. A third-party skill also carries its origin and licence in its own folder.

## How changes arrive

- **Pull requests only.** Every PR to `main` declares its brain impact in its body (`Brain impact: none`, `compatible` or `coordinated`, with a `Product:` link to the Ultimate Brain issue or PR for `coordinated`). CI enforces it. `main` accepts merge commits only.
- **Upstream changes:** a daily workflow opens or updates one PR from the `upstream-sync` branch, ending with `Brain impact: unassessed`. A person or agent assesses it, sets the real value and merges it. A conflict, or rewritten upstream history, opens one issue labelled `upstream-sync` instead. To resolve it, merge the upstream head on another branch, resolve the conflict, set `upstream.json` and open a PR declaring its impact. The workflow needs the Actions secret `UPSTREAM_SYNC_TOKEN`: a fine-grained token for this repository only, with read and write on contents, pull requests, issues and workflows.
- **Snapshot releases:** pushing a tag `brain-v<version>` on a commit of `main` whose CI succeeded publishes `ultimate-brain-skills-<version>.tar.gz`. Its notes give the snapshot's integrity, the tarball's SHA-256 and the CLI range. Released tags are never moved or deleted; a fix is a new version. To check a release, run `node tools/verify-release.mjs --tag <tag> --repo <owner>/ultimate-brain-skills`. It rebuilds the tag and compares the result with the release.
