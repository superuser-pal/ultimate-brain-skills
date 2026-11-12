---
name: brain-notion-change
description: Change the structure of the user's Notion space (a database, property, select option, relation, template, view) the safe way, design first in the product repo and then applied in Notion; run a released migration on the user's space; or check the live Notion space against the design and report drift. Use when the user says "add a property to Projects", "change the Notion space", "add an option to Kind", "run migration 0006", "migrate my Notion space", "check my Notion space", "is my Notion set up right", or after a structural edit made directly in Notion.
---

# Change or check the Notion space

The Notion space's structure is designed in the product repo, in docs/notion-space-design.md, and built from the prompts in notion/ (decisions 0019, 0022). Structure is never edited in Notion first: the design changes, a prompt is generated for just that change, the user runs it, and this skill checks the result. Content (notes, facts, decisions) is not structure; it goes through ingest, proposals and sync.

Pick the mode from the request:
- **Change:** the user wants the structure to be different. Run it in the product repo (`ultimate-brain`), where these files are edited.
- **Migrate:** a release shipped a migration (notion/migrations/) and the user's space predates it ("run migration 0006", or after `brain upgrade` says one is due). Run it in the brain, with the migration file the installed CLI ships.
- **Check:** the user wants to know whether the live space matches. Run it anywhere the Notion connection and `brain status` are available.

**Where the files are.** In Migrate and Check, every `notion/…` and `docs/notion-space-design.md` path below is under the installed package's folder, which `brain status --json` reports as `product.path` (for example `<product.path>/notion/migrations/0019-reports-move-to-documents.md`); read them there and name the full path to the user. They are the files of the CLI the brain runs, so a migration a newer release ships isn't there until the user installs that release. In Change, the paths are the product repo's.

## Change

1. **Understand the change and its consequences.** For a new or renamed property, select option or relation, find everything that names it:
   - docs/notion-space-design.md §3 (the tables), §4 (templates) and §5 (views);
   - notion/prompts/ (the build prompt that creates it) and notion/views-guide.md;
   - spec/cli.md §5.14 (sync plan's ownership table, sync render's rendered properties, value conversion), spec/schema.md §14 (Notion property mapping), and `brain.json` defaults (templates/brain/brain.json, spec/schemas/brain.schema.json);
   - skills that read or write it.

   A property the brain reads or writes is a CLI change too: say so, and add a CLI task for it (decision 0044). A change that clears the decision gate (it changes what the brain stores, or who owns a field) gets a decision record in decisions/.
2. **Change the design and the build prompts** in the same branch, so a new user building from scratch gets the new structure (0022).
3. **Write a migration**, `notion/migrations/<NNNN>-<slug>.md` (next number; format in notion/migrations/README.md), for spaces that already exist. It holds:
   - a Notion AI prompt that changes **only** this, and keeps everything else as it is;
   - the by-hand steps when Notion AI can't do it reliably (select options, see below);
   - a **Verify** list.
4. **Open a PR.** The user merges it, then runs the migration in their space.
5. **Check** (below), limited to what the migration touched, and report.

**Select options: add, never delete-and-recreate.** Options added by Notion AI can share an internal id with an existing option. Deleting one of them then deletes both. That happened with Add Link and Supersede in Review → Kind. Migrations that add an option say: add it by hand (property → Edit property → Add an option), then run the check to confirm every option has its own id.

## Migrate

Migrations run once each, in number order (notion/migrations/README.md). The file lists its changes in tables, each with **who** does it: the **agent** through the API, **Notion AI** from a prompt the user pastes, or the user **by hand**.

1. **Read the migration** in full, and check that the earlier ones were run (their Verify items hold). Find the databases from `brain config get notion.databases`.
2. **Agent steps, one at a time, each with the user's yes** (the brain's AGENTS.md: never write to Notion without it). Say what the step changes in one line, wait for the yes, make the change, then read it back to confirm it took. Order:
   - **Select options:** add them through the data source update, keeping every existing option with its id. Never delete and recreate an option (below). Then retrieve the property and check that each option has its own id; if two share one, stop and tell the user to fix it by hand.
   - **Draft pages to the trash** (migration 0020): first an attended `brain sync` up to its apply, so a Lifecycle the user set in Notion is read before anything is trashed. Then `brain sync render --unpublish-drafts`, show the count per database with a few titles and ask once. After the yes, move each page to Notion's trash (`PATCH /v1/pages/{id}` with `in_trash: true`), then `brain sync record` each one with its item's `published`. A no changes nothing. Commit in the brain: `notion: Draft pages moved to the trash`.
   - **Properties and relations:** add them with the type, the pair of a two-way relation, and the ownership description the migration gives (descriptions follow notion/prompts/05-ownership.md).
   - **Renamed properties** (migration 0009: Target → About, Decision → Your call, Note → What to fix …): rename each by its property id in the data source update, never by deleting and adding one, so its values and every view that uses it stay. Read the data source back and check each new name before the next step. A **renamed select option** (Edit → Fix) is a by-hand step: renaming it through the API can recreate it with a new id, which loses the rows that hold it.
   - **Database ids:** a migration that creates a database (References in 0009, renamed Documents in 0010) ends its agent steps with `brain config set notion.databases.<key> '"<id>"'`, then `brain status` to see it configured, and a commit in the brain: `config: <key> database`.
   - **Config flags a migration names** (migration 0013: `brain config set notion.review_sections true`): run it as the migration says, after the properties it depends on read back and after the by-hand steps it lists before it, then `brain config get notion`. Never set it earlier: the brain starts writing the new layout at once.
   - **Page blocks** (a line above a page's tabs, a Brain Assistant skill's text): through the block API, after reading the page's blocks. When the API can't insert where the migration says (above the first block of a column), add it right after and ask the user to drag it once.
3. **Notion AI and by-hand steps:** give the user each prompt, as written in the migration, with the page to open first, one at a time, and wait until they say it's done. Never rephrase a prompt.
4. **Check** (below), limited to what the migration touched, then go through its **Verify** list with the user. Items that need a catch-up ("after the first catch-up …") are checked after the next "catch up".
5. **The template version** (decision 0078). Once the migration's steps are done and checked, read `brain config get notion.template_version` (a `USAGE` error saying there is no value means the version is unknown). When it is set and lower than the migration's number (the four digits that start its file name, compared as numbers), run `brain config set notion.template_version '"<NNNN>"'`, commit in the brain (`config: template version <NNNN>`) and push per `settings.push`. A version already equal or higher stays. An unknown version (absent) stays unknown: it is never guessed from one migration. The migration's own last step updates the System page's `Template version` line in Notion; when a migration has no such step, say the line still shows the old number (with the version unknown: that the line is unchanged) and that the user can correct it by hand.
6. **Report:** what was changed, what the user still has to do by hand, the Verify items still open, and the template version now stored (or that it is unknown).

## Check

**References.** Properties and types: docs/notion-space-design.md §3, plus the relations notion/prompts/03-relations.md creates (where the two differ, the prompts are the exact definition). Ownership descriptions: notion/prompts/05-ownership.md.

1. **Find the databases** from `brain config get notion.databases` (+ `notion.tasks.database`). Without a brain, search for the page titled exactly **"Brain Data"** (ask if there is more than one), and use the ids of its child databases (brain-connect-notion skill, steps 1–2).
2. **For each database:** retrieve it, then its data source (`data_sources[0]`), and compare the properties with docs/notion-space-design.md §3:
   - **Missing or extra property:** a property the references list but Notion lacks is drift. A property in neither is the user's own: fine, report it as "yours, not used by the brain".
   - **Type:** e.g. text vs select. "Status" in the design means Notion's status type (Tasks), not a select.
   - **Select options:** every listed option exists, with the exact spelling; extra options are reported. **Within one property, no two options share an id.** The same id across different properties is normal in Notion.
   - **Relations:** they point at the right database (compare the relation's `database_id` with the configured ids), and two-way relations have their pair.
   - **Ownership description:** it starts with the owner Prompt 5 assigns (`Owner: brain.`, `Owner: you.`, `Owner: you when creating, then brain.`, `Owner: system. Do not edit.`).
   - **Formula and rollup:** Progress exists in Key Results (formula) and Goals (rollup).
3. **Report** one line per difference, most serious first, each with how to fix it:
   - **Breaks the brain:** a property the brain reads or writes is missing, renamed or the wrong type, or a select option the brain renders is missing. Fix:
     - a missing select option is added **by hand** (property → Edit property → Add an option);
     - a missing property or relation is restored with the matching migration, or with the matching part of a build prompt, quoted as a one-off prompt. Never re-run a whole build prompt on an existing space.
     - If the user meant the change, bring it into the design instead (Change mode).
   - **Confusing but harmless:** ownership descriptions, extra options.
   - **Fine:** extra properties of the user's own.

   **Not checkable through the API**, so say so and point to the Verify lists in notion/prompts/ and notion/views-guide.md:
   - templates and views;
   - display formats: percent on Progress, a date range on Dates, time on Last Synced.

**Never change anything in Notion while checking.** A fix made here skips the product repo, where structure changes first (decision 0022), and the user's yes. Report the fix; make it in Change mode or with the migration.
