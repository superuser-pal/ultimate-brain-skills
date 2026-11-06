# Writing the brain skills

The operational skills of Ultimate Brain, the `brain-*` skills each brain pins, are written here and nowhere else (spec/skills-delivery.md §9 in the Ultimate Brain repository). The product repository has no editable copy: it vendors a released snapshot of `brain/` and refuses an edited one.

- **Where:** `brain/<name>/`, one folder per skill, holding `SKILL.md` and any references it links. `snapshot.config.json` holds the CLI range of the next release and the skills `brain link` installs in a linked folder (`linked_repo`).
- **How a change arrives:** a pull request to `main`. It passes the checks (`skills`, `names`, `snapshot`, `impact`, `leak`) and declares its brain impact in its body: `none`, `compatible`, or `coordinated` with a `Product:` link to the Ultimate Brain issue or PR that needs it (spec/skills-delivery.md §10.3, §10.4). `main` accepts merge commits only.
- **How it reaches a brain:** an annotated tag `brain-v<version>` on a commit of `main` whose CI succeeded publishes the snapshot (§10.2). A released tag is never moved or deleted, so a fix is a new version. An Ultimate Brain task then vendors the release in the product (§9.5), and each brain takes it at its next `brain upgrade` with the CLI that ships it.
- **Findings** about a skill are filed in the Ultimate Brain repository as `dogfood` issues; the task that fixes one makes its skill change here.
