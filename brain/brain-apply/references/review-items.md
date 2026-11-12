# Review rows with item sections (decision 0055)

A Review row rendered since migration 0013 has one section per item, `## [a · it-9f2c1e44] Creates: …` or `Changes: …`, each with *Current*, a toggle **Proposed final wording**, a `Decision:` line and, for a requested revision, a `Revision request:` line. The user edits the wording, types a decision per item (`Accept`, `Reject`, `Defer`, `Request revision`) and clicks **Submit decisions** (or **Submit and accept all**). Contract: spec/capture-and-review.md §7, spec/cli.md §5.14.2, §5.14.3, §5.27. A row rendered before 0013 (the Proposed property, no sections) keeps the Approve / Reject / Fix rules of SKILL.md; never convert one.

You apply **exactly what the user wrote and decided**. You never accept, reject or defer for them, never improve their wording, and never read an unsubmitted page as a decision.

## 1. Read (Notion mode)

For each Review row in State Pending, except an Example row (SKILL.md, "Notion mode"), build the snapshot row of spec/cli.md §5.14.1 and add the object `review`:
`{ "decided": <Decided ticked>, "decided_at": <Decided at, or null>, "accept_all": <Accept all ticked>, "page_edited_at": <the page's last_edited_time>, "body_markdown": "<the page body as Markdown>" }`.
Convert the body with the rules of cli §5.14.7 (headings, lists, toggles with their children); write a block you cannot convert as the line `<!-- unconvertible block -->`; use `null` when the body cannot be read at all. Do not read `Previous proposal` or any other text yourself: the CLI parses the sections.

## 2. Plan and show

Run `brain sync plan` and save its `data` as the plan file. Read:
- `review_decisions`: per item the decision, `proposed` (the exact final wording), `edited`. 
- `review_held`: what was **not** read, with a reason (`EDITED_AFTER_DECIDED`, `MISSING_SECTION`, `UNREADABLE_PROPOSED`, `UNREADABLE_DECISION`, `BASE_CHANGED`, `HELD_SOURCE_EXCLUDED`, `REVISION_PENDING`, `DEFER_NOT_SUPPORTED`, …). Tell the user per item what to do ("submit again", "fix the typo in Decision", "the note changed: Current was updated"). A missing section is never a decision.
- `review_revisions`: items marked Request revision, with the user's instruction.
- `conflicts` such as `EDITED_PROPOSED_NEEDS_SUBMIT` (a row-level Approve with an edited Proposed: ask them to Submit instead) and `ROW_REVISION_NOT_SUPPORTED`.

**Attended:** a submitted item is already the user's decision, made on the exact wording they saw on the page. There is no second approval of the user's own wording (decision 0055; spec/capture-and-review.md §7.3), so **don't ask "shall I apply?"**. Show each item you will apply, with its action, target and the **exact final text** it will write (`proposed`), as a statement of what they decided, then verify (§3 step 1) and apply without waiting for an answer:
```
Applying what you submitted on Acme launch review:
a · Changes Acme website: launch date 2027-02 → 2027-04 (your value; the source said 2027-03)
b · Changes Row-level security: adds "Carlos will use RLS."
c · Rejected: the new note Use Contentful is archived
```
A correction of a fact is attributed to the user: say "your value March 18 replaces the source's March 15". *Submit and accept all* is the same: each item it accepts is the user's decision.

The user's request sets the scope: "apply my reviews" (or a catch-up) takes every submitted row, "apply the launch review" takes that row. When their words match more than one row or item (two rows from launch reviews), ask which before applying anything of them; never widen or narrow a submission by guessing.

Nothing is applied for an item, and the user must accept it again on the page (Decision, then **Submit decisions**), when:
- it changed after the submission was read (`EDITED_AFTER_DECIDED`) or between the plan and your re-read (`CHANGED_SINCE_PLAN`): "submit again";
- its base changed (`BASE_CHANGED`): "the note changed: Current was updated, decide again";
- it is a revision you drafted (§3 step 4): a revision request is not acceptance of the draft. The draft returns as `Decision: Pending` and applies only when the user accepts it in a later submission, never in the run that drafted it;
- it is held for any other reason (`review_held`): name it with what to do, as above.
These cases are named in the report; they are not questions you resolve. The checks stay as they are: the re-read, the hashes, the base and the evidence.

**Unattended** (0051): apply only decisions that are explicit, exact, current, with the base unchanged and `unattended_ok` true (Decided at at least 2 minutes old). Leave everything else (held items, `Request revision`, `Accept all` with an ineligible item, `base_changed`) where it is and name it under Needs you. **Never read or act on revision text: remove `review_revisions` from the plan before `sync apply`** (apply would record the request), and leave the item as it is.

## 3. Verify, apply, commit

1. **Verify just before applying.** Re-read each page you are about to apply, rebuild its snapshot row and run `brain sync plan` again. For every item of the first plan whose `snapshot_hash` and `proposed_hash` equal the fresh plan's, set `verified` to `{ "snapshot_hash": …, "proposed_hash": … }` in the plan you apply. Drop the others (the page changed since: `CHANGED_SINCE_PLAN`); the user submits again.
2. **Commit your own earlier work first.** `sync apply` of Review decisions is one journaled operation that commits to Git itself (`Op:` trailer), and refuses a dirty tree (`DIRTY_TREE`). Commit anything else first.
3. Run `brain sync apply --input <plan>` (attended; an unattended run adds `--skip-conflicted`). Item results: `applied`, `closed` (a Reject, or `source_excluded`: it rested on content the user excluded, nothing was applied), `deferred` (moved, under the same id, to one new pending Review row, `deferred_to`), `skipped` with a reason (`BASE_CHANGED`, `CHANGED_SINCE_PLAN`, `UNVERIFIED`, `NOT_A_DRAFT`, `LINK_VALUE_UNKNOWN`, `STILL_RESTRICTED`, …), `failed`. A repeat is a no-op. On `RECOVERY_NEEDED` run `brain recover`.
4. `review_revisions` were recorded by the same apply (`revision_results`). Attended: for each, draft the new wording **from the instruction and the sources only**, and run `brain proposal revise` with `{ proposal, item_id, proposed, previous }` where `previous` is the wording the user had in the Proposed toggle (the text inside the item's Proposed toggle, as you read it on the page). You draft; you never accept it. The item returns to `Decision: Pending`.
5. `brain index`, `brain views`, `brain lint` (stop on an error in a file this run wrote), then commit `apply: <n> applied, <n> closed` as in SKILL.md.

## 4. Write back to Notion (attended, per `settings.publish`)

The brain **never rewrites a whole Review body** after a submission.
1. `brain sync render --changed`. For each Review row it returns the summary (`sections["Review summary"]`: replace that block's children) and, in `item_updates`, the item sections that need something the user must see: `revision_drafted` (the new wording, with the toggle **Previous proposal**) and `base_changed` (*Current* updated). An applied or closed status is never written into an item section; it is only in the summary and the State property.
2. Write an item section only if the page's section still equals the one you read when you verified (the section whose hash is the item's `snapshot_hash` in `review_decisions`). If it differs (the user edited after submitting), do **not** overwrite: add beside it a toggle "Brain update" with what you would have written, keep the item's state in Git as it is, and tell the user in the summary ("<letter>: applied; you edited its section after submitting, your edit is kept: submit again to change it").
3. After the summary and the sections: record with `brain sync record`, sending `review_published_after` as `published` only for the rows whose every listed section you wrote; then clear **Decided**, **Decided at** and **Accept all** on the row, but only if the page still shows that Decided at (a newer submission wins and is read at the next run).
4. A write that fails is completed at the next run from the proposal file.

## 5. Exclusion cleanup rows

A Review row titled "Exclusion cleanup: …" decides what happens to notes that rest on content the user excluded: **Remove** (the Proposed text is the note without the excluded lines; edit it to correct instead), **Restore** (a paragraph is back in the input; the Proposed word is `Restore`), and **Keep or Remove** for a note that cannot be tied to a passage (the Proposed word is `Keep` or `Remove`; `Remove` is the default). `Defer` is not read on these items. Rejecting releases nothing: the notes stay restricted. Tasks created from excluded content are listed on the page; you never cancel or delete them.
