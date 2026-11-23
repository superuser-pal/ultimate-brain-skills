# Parts by subject (decisions 0096, 0098; spec/capture-and-review.md §7.3)

An attended ingest asks the user part by part, one part per subject: what the brain has on the subject, what is added, the questions, then the part's yes. Nothing is written until every part is answered. An unattended run asks nothing, and writes the same parts as waiting proposals (end of this file). brain-apply reads "Subjects" and "The short view" for the questions of a later session.

## Subjects

Every item you drafted (a new note, an addition, a link, a new fact, a change that needs a yes) belongs to exactly **one** subject, the first of these that fits:
1. **a project** the brain has, when the item is about that one project's work (the project itself, or a note, change or link that concerns only it);
2. else **an Area** the brain has, when the item belongs to one Area and to no single project;
3. else **a topic the brain has**: another existing note the item is about (a person, an org, a Document);
4. else **a new subject, named plainly** in a few words ("Hiring"), when the brain has no note for it. A project this ingest creates is a new subject until it is written.

Items with the same subject are one part. Parts come in the order their subjects first appear in the input. A part is headed by its subject's title, or by its `cite` when the subject note comes back in its awaiting-cleanup form, or by the plain name. Every proposal the ingest writes carries its part's `subject`: the note's id, or the plain name.

## The short view

What the brain has on the subject, in a few lines: each related note by its title with one line (its summary, else its first sentence). The notes are those `brain query --candidates "<the subject's title or name>" --limit 5` returns, and each existing note an item of the part changes or links to, read with `brain query --read` (only these when the subject note is in its awaiting-cleanup form, whose title can't be searched). A note in its awaiting-cleanup form is named by its `cite` and nothing else; an archived or withheld note is left out. Quote no passage here: a conflict's question quotes both passages. A subject with no related note reads `Nothing yet.`

## One part

```
Part 1 of 2: Pilot rollout
  Pilot scope: 3 regions, starts in March (decision, Oct)
  9 depots in the pilot
  Open: who signs off the pilot?

  Adding
  + Kickoff date moved to 4 March (new fact)
  + Risk: driver shortage in the north (new note)
  + Link: Pilot rollout → Ops lead (person)

  Q1. Depot count: 9 today, the document says 11
      a) 11 (recommended: the document is newer and signed)  b) keep 9  c) later
  Q2. "Who signs off?" is answered with "Ops lead"
      a) accept (recommended)  b) no, leave it open
  → The rest of part 1 (the 3 additions): accept?
```

1. **The short view.**
2. **Adding,** each line marked `+`: every new note (its type and title), addition (the note it goes to), link (both ends) and new fact (the note, the field, the value), with its full text. For a selected capture, the full text of each paragraph the extract copies is shown in the first part whose items cite it; a later part names it ("¶4, shown in part 1").
3. **The questions** of the part, at most five per round, in this order: changes to what the brain holds (a changed fact, a new body for a Document, a restated line, a decision replacing another, a moved note, a change to a Notion row), then merges, answers, possible duplicates and cleanup items, then each flagged item (`unsure`, `note_flags`, two values for one field). Each says what changes, quotes the brain's passage and the input's, gives lettered options with the recommended one marked and one line on why, and takes letters or the user's words (brain-apply step 3 reads them). An answer to a question that a task follows up is asked as brain-apply's "An answer to a tracked question". A part with more than five asks the next round, unless the user says "enough".
4. **"The rest of part <n> (<what it holds>): accept?"** It covers the part's undisputed items: its new notes, additions, links and new facts, less the flagged items turned down or left for later. A part with none has no step 4.

**A source with one subject** is one part, shown without "Part 1 of 1": its view, what it adds, its questions if any, then `Accept?`.

**Before the first part,** for a selected capture, one line names what the selection leaves out: `Left out (Meeting only): Small talk, s3.i2.` When the selection preview raised a blocker or a repair (references/selection.md §3), it is settled before the parts. For a checked row ([checked.md](checked.md)), one line names what the user's version changed: `Ops plan (changed), checked by you: Dropped Hiring, Appendix A; depot count 9 → 11.` Its items cite the row, never the original.

**The quick follow-ups that become Tasks** and the questions tracked by `Track: Waiting On —` are named once, after the last part: `2 quick follow-ups become tasks: …` and `1 question tracked as a Waiting On task: …`. The yes to the last part creates them; to keep a follow-up out, the user ticks or deletes it on the page (references/selection.md §4).

## The answers

- **To a question:** one of brain-apply step 3's answers. A flagged item **turned down** is not covered by the part's yes; one left for **later** waits.
- **To "accept?":** **yes** (they go in, the new notes as `reviewed`); **"all except …"** (the named items are turned down, the rest go in); **no** (none goes in, its new notes are archived); **later** (the part's undisputed items and its unanswered questions wait for a later session).
- **A grouped link item** ("People on Pilot rollout: + Ana Ruiz, + Lee Chen") is one item: it goes in or is turned down whole. Never offer to turn down one of its links.
- **"Enough"** at any point leaves the rest of the current part, and every later part, waiting, as "later" on each.
- **"Stop"** ends the ingest with nothing written: the input stays as it is in Notion, and the next run reads it again. A re-read of a document is the one exception: its new version is already written (`brain source diff` needs it, spec/capture-and-review.md §4.8, sources.md "Re-reads"), and it stays.

One part's answer never holds another part: each yes is its own decision.

## What is written, and when

Hold every answer in the session while the parts are asked. After the last part, or "enough":

1. **The notes.** The source: the `note new` batch's source item, or, for a selected capture, `brain source extract` (selection.md §4). For a selected capture you cited its passages before it had an id: write the batches with a placeholder (`EXTRACT#¶4:3fa1c2d9`, the hash from `extract-plan`'s `passages`), and replace `EXTRACT` with the id `source extract` returns in your working files before the next command. Then every new note of every part, with one `brain note new`, as `draft` (SKILL.md step 7).
2. **The proposals,** with one `brain proposal new` (SKILL.md step 8): per part, **one `review_notes`** with `source` = the ingest's provenance value and `subject` = the part's subject, holding its new notes, and its additions, links and new facts, each sent as its own item with the same `subject` (the CLI folds them in); every change that needs a yes, as its own proposal with the same `subject`. A part with only such changes has no `review_notes`.
3. **The answers,** with one `brain apply --input`, in part order. Read each part's `review_notes` back (`brain proposal list --target <one of its notes or targets>`) to map the letters you showed to its `changes`, `notes` and `links`. Per part: first one decision per answered question (brain-apply step 3); then the part's yes: `approve` of its `review_notes`, `decided_by: chat`, `note` = the user's words, `reject` naming each item turned down, `exclude` naming each flagged item left for later. "No" is `reject` of the `review_notes` (or, when a flagged item was left for later, `approve` with every other item in `reject` and the later ones in `exclude`). A part or a question left for later gets no decision and stays pending.
4. SKILL.md steps 9 to 13: rebuild, check, log, commit, publish (a Document made `reviewed` gets its page), report.

**Example.** The user answers Q1 "a", Q2 "a", part 1 "yes" and part 2 (Hiring, two new notes) "later". Written: the source and the three new notes as `draft`; a `review_notes` with Pilot rollout's id as `subject` (the risk note, the kickoff fact, the link), one with `subject: "Hiring"` (the two hiring notes), an `update_fact` with `before: 9` and an `answer`, both with Pilot rollout's `subject`. Then one `apply`: the fact `approve` (`note: "a"`), the answer `approve` (`note: "a"`), part 1's `review_notes` `approve` (`note: "yes"`). The risk note is `reviewed`, the depot count is 11, and Hiring waits with its notes `draft`, asked later as its source's question.

## Unattended

No part is asked. The run writes each input on its own, with its own batches, log line and commit (SKILL.md steps 10 and 11), before it starts the next. It writes what an attended ingest writes, by subject: the source, the notes as `draft`, and per part a `review_notes` with its `subject` and each change that needs a yes, all pending, and applies none of them. A later session asks them as one question per source (brain-apply). Quick follow-ups and questions carrying `Track: Waiting On —` still become tasks (the user's own instruction), and the report counts them.
