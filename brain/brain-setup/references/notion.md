# Steps 3 to 5: Notion

The Notion half of setup: the template, the agent's connection, the brain's databases, the two by-hand steps (each walked through and checked), and the owner's identities. Every Notion read and write goes through the Notion MCP (decision 0015); this skill builds nothing in Notion's structure (decision 0022).

## Step 3: the template and the connection

1. **The template,** only when the space was never connected (no `connect` line done, `checks.databases` failing and no `template_version`): on a resume after the connection was lost, skip it, since a second duplicate makes two Brain Data pages. Read `<product.path>/notion/TEMPLATE.md` and give the user its link: "Open this link and choose Duplicate, into the workspace you'll use for your brain: <link>." Never build the space from the prompts in setup. A user who prefers to build it gets the checklist's text from `<product.path>/notion/CHECKLIST.md`, which you give them, then comes back to this step.
   - `TEMPLATE.md` missing or without a link (an install older than the template): say so, and give the checklist's text as above.
   - **Building from the checklist:** give the text of each file it names (a prompt, a module's steps) in the chat when the user reaches it, one at a time, never its path; and adapt it to the modules chosen on the settings screen (delete the lines tagged with a module that is off, keep the rest), whatever the checklist's own defaults say.
2. **The connection,** when this session has no Notion tools: give the steps for the agent in use from the brain-connect-notion skill, "Connect your agent to Notion" (the hosted Notion MCP first), in the same message as the template's link, since the agent has to restart anyway. End with: "Once the space is duplicated and I'm connected, restart me in your brain folder and say "set up my brain"." Stop there, and log nothing: the step isn't checked until the user comes back.
3. **Check:** search for the page **Brain Data** through the MCP.
   - Found once: log `step=notion-mcp result=done`, commit, and go on.
   - No Notion tools after the user said it is connected (the restart done): log `result=failed reason=notion-unreachable` and give the steps of item 2 again.
   - Not found: log `result=failed reason=brain-data-not-found`. Say what brain-connect-notion step 1 says for it: with the hosted MCP, the user's own Notion account must have access to the duplicated space; with an integration token, add the integration to Brain Data (`•••` → Connections). The duplicate may also still be in progress: "Wait until the duplicate opens in your workspace, then say "check again"."
   - Found twice (an older space next to the duplicate): ask which one; the other stays untouched.

## Step 4: connect the brain to Notion

Run the brain-connect-notion skill's procedure, with two differences:

- **Skip its step 0:** the modules were chosen on the settings screen.
- **The template version** is stored by its step 4a (from the `Template version: NNNN` line in the System callout on the space's top page). A space without the line (built from the prompts, or older) leaves it unknown; that is not a failure.

A database still missing: log `result=failed reason=database-missing`, name the databases missing (from `notion.missing`), and stop: in a duplicate of the template, a missing database means the duplicate is incomplete or the connection can't see it.

Once `brain status` shows `checks.databases` passing, commit with brain-connect-notion's own commit, then remove the Example rows (below). Step 4 is done only after that: log `step=connect result=done examples=<n>`, commit `setup: connect`.

### The Example rows (decisions 0084, 0087)

The Notion template carries fifteen invented rows that show a filled space, at least one in every database on Brain Data (a Domain, an Area, a Project, a Person, an Org, a Meeting, two Tasks, an Inbox row, a Decision, a Question, a Document, a Review row, a Goal and a Key Result), each titled with the prefix **`Example · `**: the word `Example`, a space, the middle dot `·` (U+00B7), a space, matched exactly, case included. Nothing in the brain may ever be made from one, so they go now, before identities, seeding, a sync or an ingest reads Notion.

1. **Only in a duplicate of the template:** `notion.template_version` was stored by step 4a. Without it (a space built from the prompts, which has no Example rows, or a duplicate whose Template version line was deleted, which can't be told from one), search nothing: log `step=connect result=done examples=0`. The skills that read Notion still leave out any Example row (brain-sync, brain-ingest, brain-catch-up, brain-apply, ultimate-assistant).
2. **Find them.** Query **every database on the duplicate's Brain Data page** (each id stored in `notion.databases`, and `notion.tasks.database` only when it is the Tasks database on Brain Data), whether its module is on or off, for the rows whose title starts with `Example · `, all pages of each (a title `starts_with` filter, or read the titles and match them yourself). Never search a database outside Brain Data, such as the user's own tasks database (decision 0018).
3. **None found:** log `step=connect result=done examples=0`, and go on.
4. **Some found:** show them, one line each with its database ("Projects · Example · Website refresh"), and ask once: "Your template still has these <n> example rows. I'll move them to Notion's trash now, so nothing in your brain is made from them. OK?" On the yes, move each to the trash through the MCP (update the page with `in_trash: true`; `archived: true` on API versions before 2025-09). Query again: none left → log `step=connect result=done examples=<n moved>`.
5. **Declined, or some still there** (a write failed): log `step=connect result=failed reason=examples-left`, say they must go before anything reads the space and that the user may also delete them in Notion, and stop at step 4.
6. **On a resume,** a duplicate whose latest `connect` line isn't `result=done` runs step 4 again: brain-connect-notion's re-run leaves correct ids alone, and the query finds only the rows still there. A row already gone is fine; none left passes at once.

A row the user renamed, so its title no longer starts with `Example · `, is the user's own: leave it, like every row without the prefix.

## Step 4a: the minutes prompt

Notion AI writes each meeting's minutes with this prompt; the brain reads that shape (decisions 0055, 0067, 0079).

**Where it runs** (`<product.path>/notion/pasting-the-minutes-prompt.md`, spec/capture-and-review.md §3.4): in the **Notion AI chat on the meeting page**, never from Notion AI's settings. The transcript stays on the page: in the meeting-notes block's Transcript when Notion recorded the meeting, or in the page body when it was pasted. The prompt is always followed by this line:

```text
Write the minutes on this page, below the transcript, and nothing else.
```

1. **Walk through.** When `TEMPLATE.md` says the Meetings template already carries the minutes prompt, skip to the check. Otherwise give the user the prompt's text (the `text` block of `<product.path>/notion/minutes-format.md`) in the chat, ready to copy, and say that they should keep it handy: it runs on each meeting page, as above. Don't wait here; the sample comes next.
2. **The sample.** Give the user the sample meeting below, exactly as written. Ask them to create a new page in **Meetings** titled `Setup check: delete me` and paste the sample into its body. Then they open the Notion AI chat on that page, paste the prompt followed by the line above, and send. Wait for "done". Never write the sample from the user's own material.
3. **Read the page** through the MCP and check its shape against the prompt you gave:
   - **The lean shape** (the prompt has a **For the brain** toggle): **In one line**; **Quick follow-ups**, each with a `q` id; **Tasks for the brain**, each with its item id; one block per subject with its `s` id; and the collapsed **For the brain** toggle holding each subject's `Selection:` line and the id → quote list.
   - **The shape before it** (no toggle): the Attendees and Projects lines; one `## [sN] <Subject>` section per subject, each with the line `Selection: Use in brain`; every item on a line of its own with its `[sN.iM]` id and a quote.
   - **Either shape:** the two subjects of the sample come out as two subjects; the owner's commitment is under Tasks (or Quick follow-ups), and the decision under Decisions (or as a `Decided:` line); every quote occurs word for word in the sample.
4. **The transcript is still on the page.** Every line of the sample is on the page word for word (spacing aside), outside the minutes and the For the brain toggle: in the body above the minutes, or in the meeting-notes block's Transcript. When the page has the minutes but not the sample, Notion AI replaced the transcript. That fails with `reason=transcript-missing`, whatever the shape. Say:

   > Notion AI replaced the transcript. Put it back on the page above the minutes: restore an earlier version from Notion's version history (••• at the top right), or paste the sample again. Keep the minutes. Next time, run the prompt in the Notion AI chat on the page and add: Write the minutes on this page, below the transcript, and nothing else.

   Add any shape problem from step 3 to the same message.
5. **Pass** (the shape and the transcript): log `step=minutes-prompt result=done`, commit. **Fail:** log `result=failed` with `reason=transcript-missing` (step 4) or else `reason=shape-wrong`. A page with no minutes at all is `shape-wrong`. For `shape-wrong`, name what is missing ("no `Selection:` line under subject 2", "the quote in [s1.i2] isn't in the sample") and say the likely cause: the prompt was pasted only in part, or run outside the page's Notion AI chat. Either way, offer to check again once they've fixed it.
6. **Either way:** the test page is never set to Reviewed, so no catch-up reads it. Ask the user to delete it.

### The sample meeting

```text
Weekly sync, Harbor Lane renovation

Me: Morning both. Two things today: the kitchen layout and the schedule.
Robin: On the kitchen, the client signed off on the island layout yesterday afternoon.
Me: Great, then we go with the island layout and stop drafting the galley option.
Robin: Agreed, the galley option is dropped as of today.
Jamie: On the schedule, the tiler can only start on the fourteenth.
Me: I'll send the client the revised schedule by Friday.
Jamie: Fine, and I'll check whether the electrician can move earlier.
Me: Thanks, that's everything for this week.
```

It has two subjects (the kitchen layout, the schedule), one decision (the island layout, the galley option dropped), one commitment of the owner (the revised schedule by Friday) and one of someone else (Jamie's check with the electrician). The names are invented.

## Step 4b: Brain Assistant

Brain Assistant is the Notion AI agent the user chats with in Notion (Today, Check minutes, the buttons that message it).

**Running a skill.** In Brain Assistant's chat the user asks for a skill by its name ("Run Today"), or mentions the skill's page by its link, copied from this space's Skills database (••• → Copy link). A Custom Agent doesn't recognise a skill typed as a `/` command: never tell the user to type `/Today`. Never tell them to pick the page from the `@` picker either: it can offer another space's page of the same name, and a fresh duplicate's skills may not be indexed yet.

**The space's name.** Before the walk-through, read the title of the space's top page (Brain Data's topmost parent page; "Ultimate Brain" in a fresh duplicate) through the MCP, and search the workspace (read only) for other pages with that title and for other databases titled `Skills` or `Brain Assistant Skills`. Call that title `<top page>` below.
- Another page has the same title: "Your workspace has two pages called <top page>. Rename this one, for example to <top page> · Test, so you can tell them apart in Notion, then say done." Read the title again after "done". Nothing in the brain depends on it.
- Other Skills databases exist: say how many, and that the right one is the one under <top page>.

1. **Walk through.** Give the steps from `<product.path>/notion/TEMPLATE.md` for a duplicate when it has them (pointing the agent at the copy), else the "Setup" of `<product.path>/notion/brain-assistant.md`, as text in the chat:
   - **A Custom Agent** when the `prerequisites` line has `custom_agents=yes`: Tools and access limited to Brain Data, How it works and the Skills database (Brain Assistant's skills; "Brain Assistant Skills" in a space built before 0.14.0), each named by its space: "Add **Brain Data**, **How it works** and **Skills** under <top page>. In the picker each result shows the page it sits under; pick only those under <top page>, and if a result doesn't show it, paste the page's link instead."
   - **Personal Instructions** otherwise: the same Instructions text in the user's personal Notion AI Instructions, and the skills as personal skills.

   Wait for "done".
2. **The test task,** with Tasks on and its database mapped. Ask: "To check it, I'll create one task in your brain's Tasks, "Setup check: delete me", due today, and close it as Won't Do afterwards. OK?" On the yes, create it through the MCP in `notion.tasks.database`, with the mapped title, Due today, and Status `notion.tasks.new_task_status` when set. With Tasks off, create nothing.
3. **The check.** Name this space's Tasks database: "In Brain Assistant's chat, ask **Run Today** (by name, not `/Today`). It should list **Setup check: delete me** from the Tasks database under <top page> › Brain Data, and nothing from outside <top page>. Paste or describe what it lists." It passes when the answer lists the test task (with Tasks on) and nothing from outside the brain's databases: no task, Review row, page or meeting from another space or elsewhere in the workspace. With Tasks off, it passes when nothing from outside the brain's databases comes back.
4. **Close the test task** with the same yes: set its Status to `notion.tasks.wont_do_status` (default `Won't Do`) through the MCP.
5. **Pass:** log `step=brain-assistant result=done`, commit. **Fail** (Today read another space, or elsewhere): log `result=failed reason=assistant-reads-outside`, name what came back that shouldn't have, and give the two fixes in this order: (a) **the run used another space's Today** (picked from the `@` picker): ask **Run Today** by name again, or mention the Today page by the link copied from the Skills database under <top page>; (b) **the agent's access reaches another space**: a Custom Agent, in Tools and access remove every Brain Data, How it works or Skills not under <top page>; personal Instructions, the instruction to stay inside Ultimate Brain is missing or was pasted in part, so paste the whole text again. Offer to check again.

## Step 5: identities

Run brain-connect-notion step 6 (decision 0037): ask once which names and work email addresses the user appears under, then the owner-ruling source, the alias proposals applied in chat or a new person note, and `owner.person`. Done when `brain status` shows `checks.owner_person` passing: log `step=identities result=done`, commit.
