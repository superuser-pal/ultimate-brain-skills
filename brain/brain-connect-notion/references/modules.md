# The Domains and Factories modules

Detail for SKILL.md step 5 and "Turning a module on or off". Decisions 0113 and 0114; spec/setup.md §6.2.3, spec/linked-repos.md §1.1.

## Domain on Tasks (Tasks and Domains on)

**Domain** on Tasks is a read-only rollup (Area → Domain, Show original): the Tasks views of a Domain's home filter on it. The brain never reads or writes it, and `brain.json` maps nothing for it. Look at it in step 5 when Domains is on already, else when Domains is turned on.
- **The default Tasks database** must have it. Missing: name the 0.18.0 Notion migration that adds it (run with `brain-notion-change`). Nothing is held back.
- **The user's own tasks database,** when its mapped `area` is a relation to the brain's Areas database and it has no such rollup yet. Ask once: "Add a Domain to your tasks database, so each Domain page can list its tasks? a) yes, add it (recommended) b) no". On a), add the rollup through the MCP and read it back. On b), or when the write fails, add nothing: the Tasks views are left off the Domain homes, and everything else works. Ask again only when the user asks to change the mapping.
- With no such `area` relation, don't offer it: say in one line that Domain pages won't list tasks.

## Factory on Tasks (Tasks and Factories on)

- **The default Tasks database** has **Factory**, a relation to Factories: found, `brain config set notion.tasks.properties.factory '"Factory"'`; missing, step 2 of `<product.path>/notion/modules/factories.md` adds it.
- **The user's own:** a relation to Factories already there is mapped under its own name, without asking. Otherwise ask once: "Add a Factory property to your tasks database?" On a yes, add the two-way relation through the MCP (or the user by hand), read it back and map it. On a no, leave `factory` as `""`: rows and overviews work, and no work can be connected to a Factory.

## Domains turned on

In "turn on domains", and for setup's seeding, after the module is on:
1. "Domain on Tasks", above.
2. When the space's Home still has the tabs Areas and Projects beside Domains (a duplicate of the template), say this line, and check nothing: "On Home, delete the tabs Areas and Projects: your Domains tab replaces them."

## The Factories module

Off in a new space, and never in the module checklist of step 0 or in setup: linking a repo (brain-repos) or connecting a folder (brain-workflow) offers it once. "Turn on factories" does the same without a link.

1. **Say what it does, and ask** (a link's or a connection's message is that yes): "Turn on Factories in Notion: each linked folder gets a row with your tasks for it and an overview of what is being built. A repo's Repo tasks list on its Project or Area page goes: the overview holds its counts. Yes or no?" A no from a link's or a connection's message is recorded as those skills say.
2. `brain modules on factories`, committed (`modules: factories on`). Every linked repo gets its Factory (`data.factories`); run again, only the missing ones.
3. **Its Notion steps:** `<product.path>/notion/modules/factories.md`, from its first step that isn't done, each by whom it says (agent, Notion AI, by hand). A space duplicated from a template that has them needs none. Then `brain config set notion.databases.factories '"<id>"'` and "Factory on Tasks", and `brain modules` (its `factories` item's `missing` is empty). Commit (`connect: Factories`).
4. **The rows:** `brain sync render --ids <fac id>,…` gives each Factory its `create`; write them as brain-sync's [references/writes.md](../../brain-sync/references/writes.md) says (Brain ID looked up first, the trash too), `brain sync record`, commit (`publish: factories`). With a page of the row's Area or Project not in Notion yet, publish that first (`pending_relations`).
5. **The first overviews:** each Factory, by [brain-workflow's references/overview.md](../../brain-workflow/references/overview.md). Each repo's `Repo tasks · <name>` toggle goes with its first overview.

The steps that stay by hand (the limits, the template, the layouts, the tab) may wait: the rows and overviews work without them. Stopped halfway, "turn on factories" goes on from the first thing missing.

**Off:** `brain modules off factories`, committed. Nothing is deleted: entries, rows, tasks and the last overviews stay, and nothing of them is read or written. A workflow on a Factory isn't ended: its sessions work locally until it is on again. The `Repo tasks · <name>` toggles come back at the next catch-up.
