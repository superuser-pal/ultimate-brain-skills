# The user's answers: yes, a value, later, skip

How step 5 carries out an answer to a numbered finding. Each finding in the session record holds its proposal (judging.md), its recommendations by letter and its cluster's `evidence`.

## Reading the answer

- **"yes N"** is finding N's recommendation `a`; **"yes Nb"** its `b`; **"yes 1, 3"** each one's `a`. **"yes to all"** is every recommendation `a` of the last report shown. Nothing is applied for a finding the user didn't name.
- **A contradiction is never applied on a bare yes.** "yes 1" (or "yes to all" reaching it) makes you ask `1: which holds? a) 2027-02  b) 2027-01  c) another value`, and nothing is applied for it until the user picks one ("1a", "yes 1b") or gives their own ("1: 2027-03"). "1c" alone asks for the value.
- **A value of the user's own** takes the place of the recommendation for any finding: "2: Head of Ops at Quayside" (a stale fact), "3: keep M. Lopez" (a duplicate, the other note surviving), "4: Every release needs legal's and finance's sign-off" (a promotion). A date is written as the fact holds it (`2027-03`, `2027-03-15`); a relative one ("next Friday") counts from the machine's local date when the user answers. When a value is unclear, ask, and apply nothing for that finding.
- **"later N"** writes the finding as a Review row; **"skip N"**, with "because …" or not, remembers the skip (don't ask why). **"more"** and **"done"**: SKILL.md.
- **Order.** The answers of one message are carried out in the order of their numbers, each committed before the next.
- **A finding answered before in this session:** a "later" one can still get a yes or a skip (see "Already proposed"); for any other, say what was already done and write nothing.

## A yes

1. **Write the proposal:** `brain proposal new --input` with `{ "proposals": [ { … } ] }`, one item: the finding's proposal with `kind`, `title`, `why`, `source`, `fingerprint`, `evidence` and its own fields (`target` and `field` and `after`; `target` and `merge_into`; `target` and `content`).
   ```json
   { "proposals": [ { "kind": "update_fact", "title": "María López: role", "target": "per-3h8w2n6c", "field": "role", "after": "former PM at Acme (left in June 2026)", "why": "Acme sync, 3 Nov: \"María left Acme in June\"", "source": "mtg-8c4n2p7w", "fingerprint": "stale:per-3h8w2n6c:role", "evidence": ["mtg-8c4n2p7w"] } ] }
   ```
   Skipped `DUPLICATE_PENDING`: see "Already proposed". Skipped for another reason (`NO_CHANGE`, `ALREADY_LINKED`): the note already says it; confirm `<n>: already so; nothing to change.`
2. **Decide it:** `brain apply --input` with `{ "decisions": [ { "proposal": "<prp id>", "action": "approve", "decided_at": "<now, ISO 8601 UTC>", "decided_by": "chat" } ] }` for the recommendation as shown. For a contradiction's chosen value, or any value of the user's own: `"action": "fix"`, `"fixes": [ { "value": <the value> } ]` and `"note"` = the user's words. A duplicate kept the other way round is a fix whose value is the other note's id.
3. **Check and commit:** `brain index`, `brain views`, `brain lint`, then commit the apply's `changed` paths, the proposal, the index, the views and the log file (`reflect: <proposal title>`).

Confirm in one line, quoting values as written: `1: launch date set to 2027-02 on Acme website`, `2: role set to "former PM at Acme (left in June 2026)"`, `3: merged M. Lopez into María López`, `4: added to Acme website`. An apply that closes the proposal as stale (the note changed since you read it): `1: not changed: Acme website changed since I read it. Say "tidy the brain" again to see it as it is now.` Count `applied` only for an applied proposal.

A proposal decided in chat never becomes a Review row: it is the Git record of the yes. The note it changed is published at "done".

## "later N": a Review row

Write step 1 above and no decision: the proposal is `pending`, and becomes a Review row when the session publishes at "done". Then step 3, with the message `reflect: later <proposal title>`. Confirm `4: later; it will be in Review once I publish.` Count it in `proposals`. A contradiction needs no value for "later": the user picks it on the Review row (Approve keeps both claims as contested; Fix with the value that holds).

## "skip N"

Write step 1 above, then decide it with `"action": "reject"`, and `"note"` = the reason when the user gave one ("because she's back at Acme"). Then step 3, with the message `reflect: skip <proposal title>`. A skip is never published. Count it in `skipped`. Confirm by kind, as long as the skip lasts:
- a duplicate: `3: skipped; I won't suggest merging these two again.`
- a contradiction, stale fact or promotion: `2: skipped; it comes back only if a newer meeting or source mentions María López.`
- a theme: `5: skipped; it comes back only if more meetings or sources discuss it.`

## A theme

A theme isn't applied: its yes drafts a Document the user reviews like any new note (0076 §4). **"later" on a theme is the same as a yes**: the draft goes to Review either way.

**A yes or a later:**
1. `brain id new reference`.
2. `brain note new --input` with one note: `type: reference`, the id, `title` = the term with a capital (`Pricing tiers`), and `frontmatter`: `origin: learned`, `summary` (one line: what the subject is, from the inputs), `sources` = the inputs that discuss it, and `area` and `projects` when the inputs agree on them (every input that names one names the same). The body is the brain's explanation, short: what the inputs say about the subject, each statement ending with its input's title and date in parentheses. Only what the inputs say; nothing from memory.
3. `brain proposal new --input` with `{ "kind": "review_notes", "source": <the newest input of the cluster's evidence: the first one, by date, then id>, "notes": [<the Document's id>], "title": "Theme: <term>", "why": "<term> comes up in <n> meetings and sources, and no note has it", "fingerprint": "theme:<slug>", "evidence": [<every evidence id>] }`. No decision.
4. Step 3 of "A yes", with the message `reflect: draft <Document title>`. Confirm `5: drafted "Pricing tiers"; review it in Review once I publish.` Count it in `drafted`.

**A skip** writes no Document: `proposal new` with `{ "kind": "new_item", "title": "Theme: <term>", "note": { "type": "reference", "title": "<Term>", "frontmatter": { "origin": "learned", "summary": "…", "sources": [ … ] }, "body": "<one line>" }, "why": …, "source": <the newest input>, "fingerprint": "theme:<slug>", "evidence": [ … ] }`, then decide it with `reject` as "skip N" says.

## Already proposed

When `proposal new` skips the item `DUPLICATE_PENDING` (an earlier "later" of this session, or a Review row still pending from an earlier session), decide the `existing` proposal it names instead (`brain proposal list --status pending` shows it):
- a yes approves it, or fixes it with the user's value, as step 2 says;
- a skip rejects it;
- a "later": it is already waiting in Review; say so and write nothing.

For a theme the existing proposal is its `review_notes`: a yes or a "later" writes nothing (the draft is already waiting in Review; say so); a skip rejects it, which archives the draft.

## Counts

- **applied:** each proposal applied after a yes (a fix included).
- **proposals:** each "later" still pending at "done" (a theme's "later" counts as drafted instead). A "later" the user then says yes or skip to in the session leaves this count and counts in `applied` or `skipped`.
- **skipped:** each skip written, a rejected existing proposal included.
- **drafted:** each theme Document written.
