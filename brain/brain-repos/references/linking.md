# The link's message and its parts

spec/linked-repos.md §1.2. One message, below the kit's whole content; each part names what the setup found (the level, the work type, the statuses, the plan). Ask it once per link.

## Which form

Read `modules.factories` in `brain status`, and `asked` on the `factories` item of `brain modules`.

| Factories | The message | Answers |
|---|---|---|
| off, `asked` false | the three parts | `all / 1 / 1, 2 / no` |
| on | parts 1 and 3, numbered 1 and 2; part 1 ends "and its row in Notion" | `all / 1 / no` |
| off, `asked` true (declined, or turned off) | part 1 alone, as the yes to the kit; Factories aren't mentioned; after the link, SKILL.md Link step 5's question | yes / no |

- **3 without 2** is asked once more: "3 needs 2. All three?"
- **1 without 2** records the no to Factories: `brain modules off factories` (commit: `modules: factories off`), so part 2 isn't asked again.
- **A no to all** writes nothing and records nothing: the next link shows part 2 again.
- **A part that fails** stops the rest and keeps what is done. The report names the missing part and the words that do it later.

Without Notion (Markdown-only), only part 1 is asked.

## Part 2: show it in Notion

1. `brain modules on factories`, committed (`modules: factories on`). It gives every linked repo its Factory (`data.factories`).
2. The Notion steps of `<product.path>/notion/modules/factories.md`, the ids and the mapping, then every Factory's row and first overview: brain-connect-notion, "The Factories module", steps 2 to 5. The rollup toggle of each repo goes with its first overview: the message's yes covers it.

## Part 3: connect its work

brain-workflow's references/factory.md, "Connect a folder", from "It needs": this message is its yes, and the Area, the Projects and the plan come from the kit. Its last steps are the link back and the overview. The kit's `tasks` doesn't change.

## Publishing a Factory's row

Whenever a link, a change or an unlink moves what the row shows (Name, Area, Projects, Archived):
1. For a Factory with no page yet, look its `fac-` id up in the Factories database's Brain ID, the trash too. A hit is the page: record it, never a second one.
2. `brain sync render --ids <fac id>`, the MCP (a `create` from the default template: brain-sync's references/writes.md), `brain sync record`, and commit (`publish: factory <name>`).

Never write its Workflow, Domain or Tasks, and never take a row made by hand in. With Factories off, publish nothing.
