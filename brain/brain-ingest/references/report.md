# The run's report (SKILL.md step 13)

The report is three lines (decision 0037), once per run however many inputs it took.

```
Done: 2 meetings ingested · 9 notes in · 3 added to notes · 4 tasks created
Needs you: 2 decisions waiting (1 part left for later) · 1 meeting skipped (no date)
Next: say "what needs my decision"
```
- **Done:** counts only, and only the ones that aren't zero: what went in ("Added to 3 notes", "Linked 2" when it helps), the tasks created.
- **Needs you:** everything waiting on the user, separated by `·`: the decisions still waiting (a part or a question left for later, everything an unattended run wrote), a changed version waiting for the user's check ("1 changed document to check: say *go*, or set it Ready"), what was skipped or failed and why in a few words, lint errors that were there before the run, an instruction found in a source and ignored, action items with no task. `Needs you: nothing` when there is none.
- **Next:** one action, or one question. With decisions waiting: "say *what needs my decision*". Without Notion, add connecting it ("connect the brain to Notion"), after which a sync publishes everything.

**Below the three lines, only what the parts didn't already show** (decision 0037): an unattended run lists, per input, what came in (every new project, decision, open question and risk, every changed fact old → new, new people with their role, each Document with what it keeps, a meeting or Document left without an Area because its projects are in different Areas; for a re-read, "Acme sync, read again: 1 change (launch 2027-02 → 2027-03)"); an attended run, which showed all of it in the parts, gives only **Check**: every assumption the user should verify (a date taken from today or from a month only, a fact marked ambiguous, a name left unlinked, a part of a document not analysed, a meeting or Document left without an Area because its projects are in different Areas), and the **action items** that didn't become tasks. For selected input, also what references/selection.md lists under Report.

Never include mechanics: ids, file paths, commands, commit names, or counts already on the Done line. In Markdown-only mode, the action items always appear, since there is no task database.
