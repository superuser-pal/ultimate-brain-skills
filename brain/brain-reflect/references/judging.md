# Judging a cluster

How step 3 turns a cluster of `brain reflect --candidates` into findings. Each cluster has `rank`, `key`, `signal`, `notes` (its members: `id`, `type`, `title`, `path`, `lifecycle`, `updated`, `summary`), and, by signal, `shared`, `evidence` (its inputs: `id`, `type`, `title`, `path`, `date`, `created`, `lines`), `names`, `term`, `fingerprint` and `held`.

Read the members (their `facts`, `timeline` and body) with `brain query --read <id>,<id>,… --json`, at most 20 ids a call and as many calls as the cluster needs, and the inputs' `lines`. Read an input the same way when its lines don't settle it (the lines are `[]` when only its title, summary or frontmatter names the note). Count every note you read in `notes_read`.

**Only what the read returns** (spec/eligibility.md §10). Never open, grep or list a note file under the brain, and never fall back to one: a member or input the read withholds (`status: "withheld"`) is not judged, and a finding rests only on what was returned. A note in its awaiting-cleanup form (`title` and `path` `null`, a `cite` label) is judged on the lines, facts and timeline it returns; its missing title, summary and headings are not there to compare or quote. Older versions of an input are no input (`brain query --read` withholds them): reflection compares notes with inputs, never one version with another.

## The finding kinds

| Finding | From | What it is | The proposal a yes writes |
|---|---|---|---|
| Contradiction | `shared_ground`, `overtaken` | two claims about one fact that can't both hold, and the brain can't tell which is current | `contradiction` on the note that holds the fact |
| Stale fact | `overtaken` | an input says a fact of the note has changed since it was written | `update_fact` |
| Duplicate | `near_duplicate` | the two notes are one thing | `merge` |
| Promotion | `overtaken`, on a project or an Area | an input states a lasting rule, a commitment or a constraint that belongs on that note | `add_to_note` |
| Theme | `recurring_term` | the inputs discuss a subject the brain has no note for | a draft learned Document in its own `review_notes` |

A disagreement no fact holds (two bodies that say different things, with no `facts` key between them) gives no contradiction: no proposal kind can express it. Leave it out.

## By signal

**`shared_ground`** (two reviewed notes with references in common; no inputs). Compare the members' `facts` with each other, and each member's facts with what the other's title, summary and body say. A contradiction when they give two values for one fact (`launch_date` 2027-01 on the project; the decision "Launch Acme website in February"). The proposal is on the member that holds the fact (when both hold it, the one whose `updated` is older, then the lower id), `after` = the other member's value, `source` = the other member's id, `evidence: []`.

**`overtaken`** (one note named by inputs newer than it). Read what each input says about the note:
- **Stale fact:** the input says a fact has changed ("María left Acme in June", "the launch moved to March"). `update_fact` with `field` (an existing `facts` key of the note), `after` = the new value, `source` = the input. The new value says what holds now in the input's words: a new role (`Head of sales at Northwind`), or, when the input only says the old one ended, the old one marked as past (`former PM at Acme (left in June 2026)`).
- **Contradiction:** the input gives another value for a fact without saying it changed ("launch is in March", where the note says February), so the brain can't tell which holds. `contradiction` with `after` = the input's value, `source` = the input.
- **Promotion** (the member is a project or an Area): the input states a lasting rule, a commitment or a constraint the note's body doesn't already say ("every release needs legal's sign-off"). Not a one-off action, a task or a status. `add_to_note` with `content` = the text to add as a sentence, ending with the input's title and date in parentheses (`Every release needs legal's sign-off (Acme sync, 3 Nov 2026).`; an input read in its awaiting-cleanup form is named by its type and date, `(meeting, 3 Nov 2026)`), `source` = the input.
- An input that only mentions the note gives nothing.

**`near_duplicate`** (two notes of one type whose names match). A duplicate only when they are the same thing: the same person (same org, role, the same meetings around them), the same org, the same decision. Two different people who share initials are not one; when the notes don't say enough to tell, it is no finding. The proposal is `merge`:
- **The survivor** (`merge_into`): the `reviewed` note over a `draft`; then the one more notes reference (count its entries in `backlinks` of `brain index --json`: an administrative count of ids, read nothing else from it); then the older `created`; then the lower id. `target` is the other.
- `title` = `Merge <target title> into <survivor title>`; `source` = `agent:brain-reflect/<session id>`; `evidence: []`.

**`recurring_term`** (a term in three or more inputs, carried by no note's name). A theme only when the inputs discuss a subject under that name (`pricing tiers`, `onboarding checklist`). A phrase that recurs by habit is none: a meeting ritual ("next steps", "follow up"), a time phrase, a name fragment. The yes writes a draft learned Document: answers.md, "A theme".

## The proposal's fields

Every proposal has:
- `title` (short: `Acme website: launch date`, `María López: role`, `Merge M. Lopez into María López`, `Acme website: legal's sign-off`);
- `why`: the evidence in one sentence, quoting the input (`Acme sync, 3 Nov: "María left Acme in June"`): only a line the candidates or the read returned;
- `passages`: what the finding rests on (spec/eligibility.md §9.1; `proposal new` refuses a proposal without them). For each line it draws from, the passage references it carries (`^[src-…#¶n:…]`, without `^[` and `]`); for a fact or timeline entry, the entry's `passage`, else its `source`; for an input line with no reference, the input's id. A contradiction from `shared_ground` takes these from the other member's value, and that member's id when its value has none. A duplicate's are the two notes' ids. A theme's are in answers.md, "A theme";
- `fingerprint`, and `evidence` = every id of the cluster's `evidence`, sorted, unique (`[]` for `shared_ground` and `near_duplicate`).

| Finding | `fingerprint` |
|---|---|
| Contradiction | `contradiction:<target>:<field>` |
| Stale fact | `stale:<target>:<field>` |
| Duplicate | the cluster's `fingerprint` (`merge:<id>+<id>`, the two ids sorted) |
| Promotion | `promotion:<target>:<source>` |
| Theme | the cluster's `fingerprint` (`theme:<slug>`) |

Don't give `before` or `from`: `proposal new` fills them from the note and the source.

## Held findings

- A finding whose fingerprint is in its cluster's `held` is dropped: the user has it waiting in Review, or skipped it.
- **A skip that came back.** A contradiction, stale fact or promotion the user skipped comes back to `held` no more once an input newer than the skip names the note. Before keeping such a finding, run `brain proposal list --target <target>` and look for a rejected or closed proposal with the same fingerprint. If there is one, keep the finding only when an input of the cluster that isn't in that proposal's `evidence`, and was created on or after its `decision.decided_at` date, bears on that field (for a promotion, on that rule). Otherwise drop it and write nothing: the user's skip still stands.
- `near_duplicate` and `recurring_term` clusters whose fingerprint is held never reach you: the CLI leaves them out.
