# Skipping a finding

"skip N", with or without a reason (decision 0072 §6).

1. **A status that says why.** When the finding has `status_offers` (a task Waiting On or Someday, a project On Hold), offer them in one question: "Set it to Waiting On or Someday, so it stops being flagged?" A yes naming one applies it as that `set_task_status` or `set_project_status`, exactly as a yes does (answers.md, "A yes: apply it now"); the signal then no longer fires for it, so nothing is remembered. It counts as changed, not skipped.
2. **Otherwise it is remembered.** No offer, or the user declines them: ask for the reason once when none was given ("why, in a few words? or 'no reason'"), then run `brain assistant dismiss --input` with `{ "dismissals": [ { "key": "<the finding's key>", "reason": "<the user's words, or empty>" } ] }`. For 30 days the finding is left out of every report and counted in "skipped for now". Confirm `4: skipped for 30 days`. The store and the log line `dismiss` writes aren't committed now: the close commits them.
3. **Seeing the skips.** "show the skipped ones": read `_assistant/dismissals.json` (a missing file means none) and list every active entry (its `until` after `as_of`), of any session, sorted by `until`:

   ```text
   s1. Finance (area) · Areas without a Domain · skipped 6 Nov, back on 6 Dec · "a personal area, no Domain needed"
   s2. "Buy new running shoes" (task) · stalled tasks · skipped 2 Nov, back on 2 Dec · no reason
   Workshops (area) · empty Areas · rejected in Review 4 Nov, back on 4 Dec
   Say "unskip s2" to see it again.
   ```

   The subject is written as the report writes it, from the snapshot or the brain; a task no longer in the snapshot is `a task no longer in Notion`. The signal labels are the report's: overdue tasks, stalled tasks, stalled projects, projects with no next step, finished projects still open, misplaced projects, duplicate projects, tasks with no project, Areas without a Domain, empty Areas. After the entries come the rejected Suggestion rows (item 5), with no `s` number: the `notion_change`, `set_field` and `merge` proposals with a `finding`, rejected (`decision.action` `reject`) less than 30 days before `as_of`, from `brain proposal list --status rejected,closed`. The `s` numbers last for the session.
4. **Undoing a skip.** "unskip s<n>" names that list's entry; "unskip 4" names finding 4 when the user skipped it in this session. Run `brain assistant dismiss --input` with `{ "dismissals": [ { "key": "<key>", "remove": true } ] }` and confirm `s2: unskipped: it shows in the next report.` A later "yes 4" on a skipped finding applies it and removes its skip the same way.
5. **A rejected Suggestion row** works as a skip with no entry: the findings leave it out for 30 days from the Reject, counted in "skipped for now". "unskip" can't reach it: say `that one was rejected in Review; it comes back on <D Mon>.`
