# How your brain works

For the daily routine, copyable requests, Notion buttons and Notion AI prompts, start with the [Everyday Guide](everyday-guide.md).

Your second brain has three parts:
- **The brain itself:** Markdown notes in a private Git repo. It's the source of truth: every fact traces back to a meeting or document, and history is kept.
- **Notion:** where you look at the brain, review what came in, and decide on changes.
- **Your agent** (Claude Code or Codex): does the work. It reads your meetings and documents, writes notes, publishes them to Notion, and applies your decisions.

You never edit the Markdown by hand. You work in Notion and talk to your agent.

**Modules.** The space is a core you always have (Inbox, Meetings, Projects, Areas, People, Review) plus the modules you choose:

| Module | Adds | On for a new brain |
|---|---|---|
| **Domains** | Group Areas by work or life context | no |
| **Knowledge** | Decisions, Questions | yes |
| **Orgs** | Client and partner organizations | yes |
| **Documents** | A document, or part of one, kept as a page you can read, and what the brain learned (ideas, methods, definitions) | no |
| **Reports** | Ask the brain in the Inbox, and get a report in Documents you can refresh (needs Documents) | no |
| **Tasks** | Action items as Notion tasks | no |
| **Planning** | Goals and Key Results | no |

Change them any time by asking your agent: "turn on documents", "I don't use goals, turn planning off", "which modules do I have?". Turning one on walks you through its Notion steps; turning one off deletes nothing, and the brain simply stops reading and writing its databases. This guide describes every module; skip what you haven't turned on.

**Where the Notion build files are.** The checklist that builds your space (`notion/CHECKLIST.md`), its Notion AI prompts, each module's steps and the migrations for a space an earlier release built are installed with the CLI. `brain status --json` names their folder as `product.path`; with a global install it is `$(npm root -g)/ultimate-brain`, so the checklist is `$(npm root -g)/ultimate-brain/notion/CHECKLIST.md`. Your agent names the full path whenever it sends you to one.

---

## The Spaces

The navigation on the left of every page lists the Spaces. Each one has tabs that run from *now*, to *later*, to *done*.

| Space | Use it to | Tabs |
|---|---|---|
| **Home** | Start your day | Buttons (Quick capture, Ask the brain, New meeting, New project) · "What's on today?" (Areas: one line per area, like "Agency · 4 to review · 1 meeting", or "all clear"; Tasks; Meetings; Projects; Inbox: captures New or Ready) · "Needs you": decisions waiting and minutes to review · "What did the brain take in?" (Came in, Meetings) |
| **Tasks** | Do the work | Today · Upcoming · No date · Waiting On · Someday · Done |
| **Meetings** | Prepare meetings and get minutes into the brain | Upcoming · To review · Ready for the brain · Ingested this week · Calendar |
| **Projects** | Keep projects moving | Active · By area · Deadlines · Gone quiet |
| **Plan** | Check that your work serves your goals | Goals · Key results · Areas · Projects by goal |
| **Review** | Decide on the changes the brain proposes | Needs my decision · Sources disagree · Approved recently · Rejected |
| **Knowledge** | Find what the brain knows, and everything that came in | Decisions · Questions · Documents · People · Orgs · Inbox (What came in?: everything ingested, with what it produced; the captures still waiting are in Home's Inbox tab) |
| **Archive** (linked from System) | Find finished and archived records | One tab per database |

**Area pages** collect everything for one area: its goals, projects, tasks, meetings, decisions and open questions in views, and its people and clients as lists at the top. The brain adds a **Brief** toggle at the end: the area's projects with their status, and its recent decisions and open questions. Open one from Plan → Areas.

**Project pages** show the Brief and Decision log (written by the brain), then the project's tasks, meetings, open questions and people, "What came in?" (every input filed under the project), "What do we know?" (its decisions and Documents) and **Reports** (the project's reports), then your own "My notes".

**A Brief shows only what you reviewed.** Decisions and questions still in Draft stay out of it until you accept them in Review. When a section has nothing reviewed yet, it says how many notes are waiting: "Nothing reviewed yet: 4 notes waiting in Review".

---

## The meeting flow

Every meeting moves through **Brain Status**:

1. **Before the meeting (optional):** create it with **New meeting** on Home. It appears in Meetings → Upcoming. Ask Notion AI to prepare you for it.
2. **During the meeting:** Notion AI takes the notes on the meeting page.
3. **After the meeting:** the meeting appears in Meetings → To review (status **Not Reviewed**). Work through the "Before marking Reviewed" checklist on the page:
   - attendees linked;
   - project linked;
   - minutes follow the format;
   - minutes checked and corrected.

   Check the minutes, fix them, tick the quick follow-ups you've already done, then set Brain Status to **Reviewed**. What the minutes get wrong, fix here: it's cheaper than fixing what the brain read from them.
4. **Ingest:** tell your agent "ingest my reviewed meetings". The brain reads the minutes and sets the meeting to **Ingested**. Then:
   - new decisions, questions and Documents wait in one **Review notes** row in Review: each gets its page in Notion once you accept it there. New people arrive as **Draft** straight away, so the meeting can list them;
   - changes to things the brain already knew go to **Review**, and so does an answer it found to one of your open questions;
   - action items become **Tasks** (status To Do).
5. Set **Skipped** for a meeting the brain should never read.
6. **Fixed the minutes after the brain read them?** Set Brain Status back to **Reviewed**. The next catch-up reads the meeting again, compares it with what it read before, and proposes only what changed, in one Review row. The earlier version stays in the brain's history.

The brain only ingests meetings you marked **Reviewed**, and only when you ask: nothing runs on its own. It never edits the meeting page itself.

**Why isn't my meeting in "To review"?** Meetings dated in the future stay in Upcoming until their date has passed.

---

## Choosing what enters the brain

Meeting minutes (notion/minutes-format.md; ask Brain Assistant to "check minutes") are a short summary for you: **In one line**, your **Quick follow-ups** (checkboxes tagged `[q1]`, `[q2]`, …), the **Tasks for the brain**, then one block per subject whose lines start `Decided:`, `Open:`, `Concern:`, `Waiting on <name>:` or `Idea:` and end with an id like `[s2.i3]`. A collapsed toggle **For the brain** at the end holds the Attendees and Projects, each subject's line `[s2] Selection: Use in brain`, and the quotes from the transcript behind each line. Correct a summary line and the brain reads your wording; keep its tag at the end. A voice note ("Voice summary") is written as **subjects**, each with a line `Selection: Use in brain`, and **items**, one line each with an id and a short quote from the transcript. Everything is included unless you mark it:

- **Leave a subject out:** change its line to `Selection: Meeting only` (in a meeting, that line is in **For the brain**). It stays on your Notion page and out of the brain.
- **Leave one item out:** in a meeting, open **For the brain** and write `Meeting only:` at the start of its quote line (`Meeting only: [s2.i3] "…"`); in a voice note, at the start of the item. **Keep one inside an excluded subject:** write `Use in brain:` in the same place. In a meeting, never write them on a summary line: there they block the meeting, and the brain says why.
- **Confirm:** set the meeting to **Reviewed** (a voice note or capture to **Ready**). Until then nothing is ingested, and the brain never confirms for you. Reviewed confirms what you can see on the page when the next run reads it.
- The brain keeps only the **paragraphs** of the transcript your selection includes, not the whole transcript. A paragraph shared by an included and an excluded item stays out; the agent tells you which two items collide and proposes tighter quotes.
- **Tasks:** only your own explicit commitments become Tasks. Someone else's commitment becomes a Waiting On task only when you write `Track: Waiting On —` before that item. A vague idea ("we could…") never becomes a task.
- **Questions** are only what a later meeting or document can answer. A to-do is never filed as a question (0.9.1): yours becomes a task, someone else's stays in the meeting's text. If older open questions are really to-dos, say "turn my to-do questions into tasks": the brain lists them, and on your yes turns yours into tasks and drops the others (Status Dropped; they stay in the Archive).
- **Quick follow-ups and Tasks:** your own actions come in two groups. **Quick follow-ups** (a link to send, a call to book) are checkboxes. Tick the follow-ups you've done before you mark the meeting Reviewed: each one still unticked becomes a Task with the meeting's projects and no due date (with the Tasks module off, they stay on the page); tick or delete one to keep it out. The brain never ticks or edits a checkbox, never creates the same follow-up twice, and keeps a follow-up's text out of its notes. Each item under **Tasks for the brain** has a **Scope** toggle: edit Done when, Due, Project and Notes before you mark the meeting Reviewed, and the Task is created with them.
- **Minutes written with an earlier prompt** (before 0.14.0) are read as before: `Meeting only:` and `Use in brain:` go at the start of the item, and their quick follow-ups stay on the meeting page and never become Tasks.
- **Quotes:** a quote that is too long or slightly reworded no longer blocks the meeting; the agent tells you which item it couldn't place. Only a quote under something marked Meeting only must match the transcript exactly.
- **Changed your mind later?** Edit the tokens and set the meeting back to Reviewed (or the capture to Ready), or tell your agent. Deleting a line on its own is not a request: the brain keeps what it has until you ask. When something is taken out, a Review row **Exclusion cleanup** lists what already rests on it: **Remove**, **Restore** (a paragraph is back) or **Keep or Remove** for a note that cannot be tied to a passage. Rejecting it releases nothing; Tasks made from excluded content are listed for you to act on and are never cancelled by the brain.

---

## Deciding in Review

**What approving does:** it makes the brain's notes **trusted**. Approved notes appear in your Briefs and in the brain's answers; until then, the brain treats them as unconfirmed. Start from Home → **Needs you → What's waiting for you?**: it counts what waits, by Kind, and each row's **About Page** opens the meeting or Inbox row it came from.

The brain never changes what it already knows without your yes. Each row in **Review → Needs my decision** says what it is **About**, what it is **Now** and what is **Proposed**, and **Why** quotes the source.

1. Set **Your call**:
   - **Approve** applies it;
   - **Reject** drops it;
   - **Fix** applies it, corrected: say what's wrong in **What to fix**, in your own words ("it's March, not February", "Lucía is on Acme website, not Acme app").
2. **What to fix** also works with Approve, to leave items out: "all except b, e".
3. Tell your agent "apply my reviews" (or "catch up"). The agent reads What to fix, applies it, and repeats every correction back to you in its report ("a: launch set to March, not February"), so you can check it read you right. It never applies something you didn't clearly say; when unsure, it asks.
4. **30 days after you decide,** the next catch-up moves the row to Notion's trash, so Review holds only what's recent. The brain keeps every decision, and Notion keeps the trash for 30 more days.

**Suggestion rows** come from Ultimate Assistant when you say "propose" (see Review your work): one change each, such as a task's Status or a project's Area, with Now and Proposed. Approve, Reject or Fix them like any row; an approved one is made in Notion by your agent's next run.

**One row per meeting, email or document.** Everything one input brings is one row, "From Acme launch review: 2 changes, 6 new notes and 2 links", with its items lettered in **Proposed**:

```
a) ⚠ Launch date on Acme website: 2027-02 → 2027-03
b) Add to Row-level security: Carlos will use RLS for the auth migration.
c) Decision: Use Contentful as the blog CMS
d) Question: Who signs off the launch post?
…
h) People on Acme website: Lucía Fernández
```

Changes to what the brain already knew come first, and a changed fact is marked ⚠: those are the ones to read closely.
- **Approve** accepts them all: the changes are made, the notes become **Reviewed** and appear in the Briefs, and the links are added.
- **Approve** with "all except b, h" accepts the rest. b and h aren't rejected: they move to a new row, "Deferred from Acme launch review", for you to decide later.
- **Fix** with "a: March" applies everything, with a corrected.
- **Reject** applies nothing, and archives the notes that are still Draft: they never get a page in Notion. Nothing is deleted.
- If a fact changed since the row was written (you edited it in Notion, say), only that item is dropped, and the report says so. The rest applies.

**Review rows with sections (after migration 0013).** A row from one input is a page: a short summary at the top, then one section per item, `## [a · it-9f2c1e44] Changes: Launch date on Acme website`, each with what the note says now, a toggle **Proposed final wording**, and a `Decision:` line.
1. Edit the text inside **Proposed final wording** if you want it different. That exact text is what the brain writes. If you change a fact (March 15 to March 18), your value becomes current and the brain records it as your correction; the source's value stays in the history, attributed to the source.
2. Type the decision on the `Decision:` line of each item: `Accept`, `Reject`, `Defer` or `Request revision` (write what you want on the line `Revision request:`). Leave `Pending` to decide later. Decide some items now and the rest later.
3. Click **Submit decisions**, or **Submit and accept all** to accept every item still on Pending (items you decided explicitly keep your decision). Nothing is read before you click.
4. Tell your agent "apply my reviews". It shows each item's action and exact text first (in an attended run), and applies only what you decided. A scheduled run applies only decisions that are explicit, exact, unchanged and at least two minutes old, and never reads a revision request.
5. The top summary shows "3 of 5 decided: 2 applied, 1 closed, 2 waiting for you". An applied or closed status is not written into your sections. If the note changed after the item was written, the section is updated with the new text and your decision resets to Pending. A requested revision comes back as a new draft in **Proposed final wording**, with your earlier text in **Previous proposal**, and `Decision: Pending`: the brain never accepts a draft for you.
6. Your edits are safe: the brain does not rewrite a row that has edited wording or a decision on it. If you edit a section after clicking Submit, the brain keeps your edit and shows what it would have written in a toggle "Brain update"; submit again to change it. A tiny window remains between the agent's read and its write; Notion's page history recovers an overwritten sentence, and nothing canonical is lost.
7. An item that rests only on content you excluded is closed without applying anything, even if you accepted it.
Rows from before the migration keep **Your call** and **What to fix** until they are done.

**Three kinds of row.** Every Review row's Name says which it is:
- **From <source>:** everything one meeting, email or document brings, lettered as above;
- **Conflict: …** two sources disagree, a new decision replaces an older one, or two records may be duplicates. These need your judgment, so each has a row of its own;
- **Answer: …** new material answers one of your open questions.

**Answer rows.** When new material answers one of your open questions, an Answer row says so: "Who owns the mobile app? → Carlos Ruiz owns it". Approve it and the question shows as **Answered** in Notion; Fix it to give the answer yourself; Reject it and the question stays open.

**Type your corrections in What to fix,** never in About, Now or Proposed: those are the brain's, and typing there does nothing.

The row's **Kind** property (hidden in your views) says exactly what the brain proposes:

| Kind | Approve means |
|---|---|
| Review Notes | Everything listed: the changes are made, the notes become Reviewed and get their pages, the links are added. Reject archives the Draft notes |
| Update Fact | The new value replaces the old one; the old one stays in the history |
| Add To Note | The text is added to the note |
| Update Body | A Document's text is replaced by its new version; Proposed shows the lines that change (`-` old, `+` new) |
| Add Link | The links listed are added (people to a project, an alias to a person) |
| Contradiction | Two sources disagree; both claims are kept as contested. Fix with the true value |
| Supersede | A newer note replaces an older one, which is archived |
| Merge | A duplicate is folded into the record it duplicates |
| New Item | A new note is created as Reviewed, with its page |
| Answer | The question gets this answer and shows as Answered |

**Fix works on every kind.** To see why a change was proposed, open the row: **Why** quotes the sentence from the source, and **Source Meeting** links to the meeting when there is one.

A rejected change can come back if a later meeting says the same thing again.

---

## Correcting what came in

**How do I correct what came from a meeting?** It depends on where the mistake is:
- **The minutes are wrong** (a misheard name, a wrong date): fix the minutes on the meeting page, then set Brain Status back to **Reviewed**. The next catch-up reads the meeting again and proposes only what changed, in one Review row. The same goes for a capture: fix its text and set its Brain Status to **Ready**.
- **The minutes are right, but the brain read them wrong** (the wrong project, a suggestion taken as a decision): on the Review row, set Your call to **Fix** and say what's wrong in What to fix ("c is a suggestion, not a decision", "a belongs to Acme app"). If the row was already approved, tell your agent what's wrong, or set the note's Lifecycle to **Disputed**.

**How do I refresh a report?** Two ways. **Click Refresh report** on the report's page in Documents: Brain Assistant adds one toggle at the end of the page, "Proposed refresh · based on Notion", with a new version written from the brain's Notion pages (the report's own text stays as it is, and a second click replaces only the toggle). To use it, replace the report text with what is in the toggle, delete the toggle, and click **Accept**; the next "catch up" shows you what changes and takes it in. **Or** tick **Refresh asked** by hand (or say "refresh the Acme launch report") to have the brain rewrite it from its notes in Git; it waits while a proposed refresh or an unaccepted edit is on the page. A new **Ask the brain** row always makes a new report. The earlier versions stay in the brain's history.

**What does accepting do?** Brain Assistant's text lives in Notion until you accept it. Click **Accept** when the text is final. The next catch-up compares the page with the brain, shows you exactly what will replace the brain's version, and takes it in after you say yes. Nothing is taken in while a "Proposed revision" or "Proposed refresh" toggle is still on the page, and if you edit the page after clicking Accept, click it again: an edit made in a later minute cancels the acceptance. (An edit in the same minute as your click, before the catch-up first reads the page, cannot be noticed, so leave the page alone for that minute.) A scheduled run takes in an acceptance only if it is at least two minutes old. The catch-up may also propose a "Related knowledge" list for a Document, as a Review row you approve or reject; for a report it only tells you what the brain knows that the refresh does not.

**A report says something wrong?** Write it in the report's **What to fix** (on its page in Documents) ("Lucía left Acme in June"). The mistake lives in the notes the report rests on, so the next catch-up turns it into Review rows on those notes. Once you approve them, it refreshes the report.

---

## What you can edit, and what the brain owns

Hover over a property name to see its owner. Each description starts with "Owner: you", "Owner: brain" or "Owner: system".

| Owner | Examples | What happens when you edit it |
|---|---|---|
| **You** | Status, Priority, Dates, Lifecycle, Archived, Your call, What to fix, Brain Status on meetings, Project, Area, Kind and Only keep on an Inbox row, the buttons and the boxes they tick (Document asked, Promote asked; Refresh asked, ticked by hand), Accepted and Accepted at (set by the Accept button) | Your value stands. The brain reads it but never overwrites it; it unticks a button's box and clears a report's What to fix once it has acted on them, and sets a row it took in to Done. It fills Kind only when you left it empty |
| **Brain** | Summary, Role, Client, Key Facts, Why, Assessment | The next sync reads your edit as a **correction**. Names, summaries and relations change in place; a key fact gets a dated history entry; judgments such as Assessment become a Review proposal |
| **System** | Brain ID, Last Synced, Ingested At | Don't edit. The brain uses them to match records |

**Page text:**
- **Brief and Decision log** on project pages, and the **Brief** on area pages, are rewritten by the brain on every sync. Anything you type inside them is lost.
- **My notes**, and everything else on a page, is yours.
- Decision and Question pages are written entirely by the brain. So is a Document's page, except a promoted one ("Buttons" below): its text is yours once it's made.
- A capture's text is yours; the brain only adds its Kind, Summary and what it produced. An Ask row's text is yours too.
- **Inbox rows the brain creates** (a document, email, web page, a repo file) get a **digest** in their body: what the input is, a summary and the key points, with figures and dates as stated. It is written once and never read back, so an edit you make there stays in Notion. To read the whole input in Notion, keep it as a Document ("Buttons" below). The original file is the real copy. A **Full text** toggle on an older row stays as it is.
- A question's **Status** is yours. The brain sets it twice at most: **Open** when it creates the question, and **Answered** once, when you approve an Answer row.

**Lifecycle** tells you how far to trust a record:
- **Draft:** new, not reviewed by you yet (people only: a new decision, question or Document waits in Review instead);
- **Reviewed:** you checked it, usually by approving its Review notes row;
- **Disputed:** you think it's wrong;
- **Archived:** no longer current.

Only People, Decisions, Questions and Documents have it: the brain writes those from what it reads. Domains, Areas, Goals, Projects and Orgs are yours from the start, so they have none; close one with **Archived**.

Set **Disputed** on anything wrong. The brain stops relying on it, and you can ask your agent to fix it.

---

## The Inbox and its buttons

Every Inbox row moves through **Brain Status**: **New → Ready → Done**.
- **New:** a row you created by hand. The brain leaves it alone.
- **Ready:** the brain takes it in at the next "catch up". **Quick capture** creates its row as Ready.
- **Done:** the brain took it in, or skipped it and says why in Summary ("Skipped: same as Acme requirements"). Rows the brain creates for documents, emails and web pages start as Done.

**Buttons** ask the brain for something. Each ticks a box on the same row, which reads as "waiting for the brain"; the next "catch up" acts on it and unticks it.

| Button | On | Ticks | The brain then |
|---|---|---|---|
| **Keep as document** | Inbox rows | Document asked (and sets the row to Ready) | Keeps the row's file, or its text when it has no file, as a **Document**: the whole of it, or only what you wrote in **Only keep** ("just the requirements table") |
| **Refresh report** | Reports (Documents) | nothing (it sends a message to Brain Assistant) | Proposes a refreshed version in a toggle, based on the brain's Notion pages; you accept it with **Accept** |
| **Tidy capture** | Inbox rows of Kind Capture, Brain Status New | nothing (it sends a message to Brain Assistant) | Rewrites the capture's text as clear sentences, keeping every name, number, date and quote; the row stays New, and you set Ready afterwards |
| **Write up** | Documents (promoted ones) | nothing (it sends a message to Brain Assistant) | Develops the page into Purpose, Main content, Open questions and Sources, from the brain pages it links; a second click keeps your edits and adds a "Proposed revision" toggle |
| **Accept** | Documents (a write-up or a report) | Accepted and Accepted at | Marks the page text as final. The next catch-up shows you the change against Git and, once you say yes, puts exactly that text in the brain and unticks the box |
| **Promote to document** | Decisions | Promote asked | Makes a Document from the note, linked both ways, whose text is yours to edit from then on |

**Documents** (the Documents module). A Document is a page you read, linked to its source, project and area:
- **the whole input:** the text exactly as it came in. It needs no review and is Reviewed straight away;
- **a part** (Only keep set, or "also keep the budget from the Acme doc"): what you asked for, as a list or a table. It waits in the source's Review row, like a new note, and gets its page when you approve it;
- **learned:** an idea, method or definition the brain learned from what it read (a concept before 0.9.1). It waits in the source's Review row, like a new note, and gets its page when you approve it;
- **promoted** from a decision: it starts from the note, then you write in it.

The brain still reads every input for decisions, questions and people, whether or not you keep it as a Document. A new version of the file later proposes only the lines that changed.

---

## Adding things

| You want to add | Do this |
|---|---|
| A quick thought, link or idea | **Quick capture** on Home. It lands in the Inbox (Home → What's on today? → Inbox) as **Ready**. Set its **Project** if you know it, so the agent doesn't ask. A row you create by hand starts as **New**: set it to Ready when it's ready. Then "catch up" (or "process my inbox") |
| A meeting | **New meeting** on Home, or let Notion AI create it when it starts taking notes |
| A project, area, goal, person or org | Create the row in Notion (**New project** on Home for projects). The next sync imports it into the brain. Or ask the agent for a new project: it writes the note and the publish creates the page from the Projects template |
| A document (PDF, Word, PowerPoint, Excel, saved HTML page, image) | Put it in your drop folder and tell your agent "process my drop folder". It lists the files and asks once which to take, and, with Documents on, whether to **keep each as a document**: "no" (the default: the brain only reads it), "all", or "only the requirements" ("The Inbox and its buttons"). A new version of a document later proposes only the lines that changed. Then, each ingested file moves to `processed/` inside the folder, so what's left at the top is what the brain hasn't read yet. Or name one file: "ingest this PDF: ~/Documents/brain-dropbox/proposal.pdf". Word, PowerPoint, Excel and HTML files need MarkItDown installed once: `pipx install 'markitdown[all]'` |
| A web page | Give your agent the link: "ingest this page: https://…". For a page behind a login, save it as a PDF in your drop folder instead |
| A file from your phone | Attach it to a **Quick capture** (or to the meeting page), with Project set if you know it. To keep the file itself as a Document, click **Keep as document** (and write in **Only keep** if you want just a part). The row is Ready; the next catch-up reads the file with the row. Files on project and area pages are not read |
| A repo's knowledge (decisions, docs, changelog) | "link the repo at ~/code/acme-api". The agent proposes a link kit (what to read and never read, where the repo's tasks live, its Area and Project) and writes it into the repo only after your yes ("Projects in other folders" below). Each catch-up then reads the files changed since the last one; the first time, it asks which to take. Apart from the kit, the brain never writes to the repo |
| A question for a full report | **Ask the brain** on Home: type the question as the Name ("Where do we stand with the Acme launch?"). The next catch-up answers with a report in **Documents**, linked from yours, and on the project's or area's page under **Reports**. To bring it up to date later, click **Refresh report** on it ("Correcting what came in"). Needs the Reports module (and Documents) |
| An email, chat thread or note | Paste it into a **Quick capture** (keep who sent it and when). For a thread, run **`/Clean email`** on the page: Brain Assistant gives each message a heading with names and date ("Tomás Vidal → Lucía Fernández · 3 Dec 2026"), its own text word for word below it, and a divider before the next, newest first. It drops addresses, signatures, disclaimers, quoted copies and Teams, Zoom or Meet blocks, and rewrites the page right away (the page history keeps the original), asking first only when something is truly unclear. Then set the row to **Ready** and "catch up". Or paste it straight to your agent: "ingest this email" |
| A task | Add it in Tasks. Action items from meetings, and your own from documents, emails and captures, are created for you |

**Tasks:**
- New tasks from the brain start as **To Do**.
- Choose **Won't Do** for work you have dropped. It leaves due views and reminders and stays available to reopen; it is counted separately from completed work. Project progress excludes dropped tasks from its denominator and shows no percentage when no active scope remains.
- **Doing**, **Waiting On**, **Someday** and **Done** are for you; the brain never reads them.
- A task without a due date shows in Tasks → No date.

---

## Ask Brain Assistant in Notion

**Brain Assistant** is a Notion AI agent that reads Ultimate Brain and answers. It never changes your knowledge. Open its chat (Agents → Brain Assistant, or @mention it on a page) and type a skill or a question:

| Type | You get |
|---|---|
| `/Today` | What's due today, today's meetings, and what needs your decision |
| `/Review queue` | Each pending change explained, without deciding for you |
| `/Check minutes` (on a meeting page) | Missing sections and names and numbers to confirm; fixes the text after you say yes |
| `/Prep` (on a meeting page) | Past meetings, open questions, tasks and recent decisions for that meeting |
| `/Weekly review` | What got done and decided, goal and project health, next week |
| `/Plan check` | Projects without goals, goals without projects, overdue items |
| `/Tidy capture` (on a new capture in the Inbox; also the **Tidy capture** button) | A cleaner version of the capture; replaces the text after you say yes (the button carries the yes) |
| `/Clean email` (on a new capture holding a pasted email thread) | Each message under a heading of names and date, its own text word for word, a divider between messages, newest first; no addresses, signatures, disclaimers, quoted copies or meeting blocks; rewrites the page directly and asks only on a serious doubt |
| **Write up** and **Refresh report** (buttons, not commands) | Click them on a Document or a report; see the buttons table above |
| "how do I …?" | An answer from this guide |

Brain Assistant reads; your agent in Claude Code or Codex writes. To get something *into* the brain, use the phrases below.

---

## Review your work

**Ultimate Assistant** looks at the shape of your work (Areas, Domains, Projects and Tasks) and tells you what needs you. Say "review my projects" to your agent, or narrow it: "what's stalled in Clients?". In Claude Code you can also start a session with it directly: `claude --agent ultimate-assistant` in your brain folder.

It reads your Tasks, Projects and Areas live from Notion, and the brain's meetings and notes, and shows a report first:

```text
Ultimate Assistant · whole brain · 6 Nov 2026
Notion read live: 42 tasks, 9 projects, 6 areas.

1. Overdue · "Send the revised quote" (task in Acme website) · due 29 Oct, 8 days late
   a) give it a new due date  b) mark it Done  c) mark it Won't Do
2. Stalled · Acme website (project) · nothing done or mentioned for 23 days (last: meeting Acme sync, 14 Oct)
   a) set Status to On Hold  b) add a next step  c) set Status to Done
…
10. Structure · Health (area) · no Domain
   a) put it in a Domain

14 more. Say "more", or name an Area, Domain or Project.
3 skipped for now.
Answer with "yes 1, 2b", a change ("1: due Friday"), "skip 4 because …", or "propose 5" for a Review row; "done" to finish.
```

**What it checks,** with the same thresholds for everyone: a task 3 or more days past its due date (overdue) or not edited for 14 days (stalled); an Active project with nothing done or mentioned in the brain for 21 days, with no next step, or with every task done but still open; a project whose notes mostly sit in another Area; two projects that look like the same one; an Area with nothing active, or with no Domain. Tasks set to Waiting On or Someday aren't nagged about. It shows the 10 most important findings, worst first, and "more" shows the next ones.

**It changes nothing without your yes.** You answer in the chat:
- **"yes 1, 2b"** makes those changes now: "yes 1" is the first suggestion (a), "2b" the second. "yes to all" takes every a). When a change needs something from you (a new due date, which Domain), it asks first. You can also say the change yourself: "1: due Friday", "3: mark it Waiting On".
- **"propose 5"** writes the change as a **Suggestion** row in Review instead, so you can decide it later in Notion like any other row. Once you approve it, the next "apply my reviews", "catch up" or review session makes the change.
- **"skip 4 because it's a personal area"** stops it being flagged. When a status says why (a task Waiting On or Someday, a project On Hold), it offers to set it; otherwise it remembers the skip for 30 days, with your reason. "show the skipped ones" lists them, and "unskip s2" brings one back. Rejecting a Suggestion row counts as a skip for 30 days too.
- **"done"** ends the session: it tidies up, commits and pushes, and says what changed.

**Tell it what's on your mind.** Say several things at once ("the Acme quote is done, I should call Lucía about the contract by the 13th, and maybe a blog series on onboarding") and it lists where each goes: a change to an existing task or project, a new task in Tasks (with its project and due date), a new project from your template, or an Inbox capture for the next catch-up. Nothing lands until you say "yes to all", or yes to the ones you want; "later 17" keeps that one as a New capture.

If Notion can't be reached, it reviews the brain alone, says so on the report's second line, and offers no change to a Notion field until next time.

---

## Tidy the brain

Ultimate Assistant looks at the shape of your work; **tidying the brain** looks at the notes themselves. Say "tidy the brain" to your agent (or "what's inconsistent?", "any duplicates?"). It reads your notes and the meetings and sources of the last 30 days, and shows a report first:

```text
Tidy the brain · 8 Nov 2026
Read 412 notes, and 37 meetings and sources from the last 30 days.

1. Contradiction · Acme website (project) · launch date 2027-01 here; "Launch Acme website in February" says 2027-02
   which holds? a) 2027-02  b) 2027-01  c) another value
2. Stale fact · María López (person) · role "PM at Acme"; Acme sync, 3 Nov: "María left Acme in June"
   a) set role to "former PM at Acme (left in June 2026)"
3. Duplicate · M. Lopez and María López (people) · the same name once initials are ignored
   a) merge M. Lopez into María López
4. Promotion · Acme website (project) · Acme sync, 3 Nov: every release needs legal's sign-off
   a) add to the project: "Every release needs legal's sign-off (Acme sync, 3 Nov 2026)."
5. Theme · pricing tiers · in 4 meetings and sources, and no note has it
   a) draft a Document on pricing tiers

12 more. Say "more".
Answer "yes 2, 3", "1a" for the value that holds, "later 4", "skip 5 because …", or "done".
```

**What it looks for:** two notes that give a fact two values (a **contradiction**); a fact a newer meeting says has changed (a **stale fact**); two notes that are one person, org or decision (a **duplicate**); a lasting rule said in a meeting that belongs on its project or Area (a **promotion**); and a subject that comes up in three or more recent meetings and sources with no note of its own (a **theme**). It shows the 10 most serious, contradictions first, and "more" shows the next ones. Content you excluded from the brain is never used as evidence.

**It changes nothing without your yes.** You answer in the chat:
- **"yes 2, 3"** makes those changes now: a fact updated, a duplicate merged into the note named (its links and aliases moved, the duplicate archived), a rule added to the project with the meeting it came from. A **contradiction** always asks which value holds first: "1a", or your own value, "1: 2027-03". You can give your own value for any finding: "2: Head of Ops at Quayside", "3: keep M. Lopez".
- **A theme** becomes a draft Document, citing the meetings and sources behind it, that you review in Review like any new note.
- **"later 4"** writes it as a row in Review instead, to decide in Notion.
- **"skip 5 because …"** hides it. A skipped merge stays skipped: two notes you said are different stay different. A skipped contradiction, stale fact or rule comes back only when a newer meeting or source mentions that note, and a skipped theme only when more meetings discuss it. Rejecting its row in Review counts as a skip too.
- **"done"** ends the session: it publishes what changed and the "later" rows, and says what changed: "Done: 3 changed, 1 Review row, 1 skipped, 1 drafted."

It runs only when you ask. When nothing needs tidying it says "Nothing to tidy." and writes nothing. Ultimate Assistant's sub-agent runs it too: `claude --agent ultimate-assistant`, then "tidy the brain".

---

## Run catch-up on a schedule

Say "run catch-up every morning" (or "twice a day", "on weekdays") and the agent sets it up with you: the times, the Claude model to pin, and what a scheduled run may use. On a Mac it installs a background job; on other systems it gives you a line to add with `crontab -e`. The job runs `claude -p "catch up unattended"` in your brain folder, so your computer has to be on and Claude Code signed in at that time.

**What a scheduled run does.** It takes in what is waiting, up to 10 inputs a run, oldest first (change it with "raise the scheduled budget to 20"), and the rest waits for the next run. It carries out the decisions you already made word for word: Approve or Reject with nothing written in What to fix, and your edits in Notion. It never turns your words into changes: a **Fix**, an Approve with a note in What to fix ("all except b"), and a What to fix on a report all wait for your next "catch up", because turning words into changes is a judgment nobody would check. A meeting or capture that needs a question answered stays where it is (the meeting Reviewed, the row Ready). A run with nothing waiting writes nothing.

**Where you find out what it did.**
- Your next **"catch up"** opens with one line: "Since last time: 4 scheduled runs, 6 inputs in, 1 skipped, 1 Fix waiting, 1 failed: Notion login". It also warns "Backlog growing" when three runs in a row left inputs over: run it more often or raise the budget.
- With **Reports** on and **publish: auto**, a run that needs you or failed also adds one row to the Inbox, of Kind Catch-up ("Catch-up 29 Oct: 2 in, 1 needs you"). A run that went well adds nothing.
- With publish **ask** (the default), a scheduled run commits and pushes but publishes nothing to Notion; your next catch-up publishes. Say "publish automatically" to change that.

**Check or stop it:** "what is scheduled?" lists it, "stop the scheduled catch-up" removes it, and asking again with other times replaces it. If Claude Code's login to Notion expires, scheduled runs can't read Notion: that shows as a failure in the summary, and signing in again fixes it.

---

## Projects in other folders

Your work often lives outside the brain: a software repo, or a folder of documents for a workshop. Two things connect it to the brain, and you choose each one.

**Linked repos** give the brain a repo's knowledge. Say "link the repo at ~/code/acme-api". The agent reads the repo and proposes a **link kit**, a small file `brain-kit.json` in the repo saying:
- what the brain reads (decision records, docs) and what it never reads (`.env` files, secrets, client folders), even when a pattern matches;
- where the repo's tasks live: **in the repo** (a `TASKS.md` checklist, or GitHub or GitLab issues), or **in Notion**, through a connected workflow;
- how work is done there, in a sentence or two;
- its Area, and its Project when it serves one.

You see the whole file before it is written, and the agent writes it only after your yes, again for every later change. The kit is the only file the brain ever writes in a linked repo; you commit it there yourself. The agent then asks once whether the repo should also read the brain (it adds `.brain`, a block in AGENTS.md, and the brain-query, brain-workflow and brain-workflow-adopt skills there).

When the tasks stay in the repo, the Project or Area page gets a toggle **Repo tasks · acme-api**: a read-only count of done, open and waiting tasks, with the open ones listed. It changes nothing in the repo. "check my linked repos" finds a repo that moved, a kit that changed, a pattern that matches nothing or a rollup that is out of date, with the fix for each. "unlink acme-api" stops reading it; what the brain already learnt from it stays. "start a new repo for <project>" creates one from a simple starter (README, AGENTS.md, decisions/, docs/, `TASKS.md`), with its kit, after your yes.

**Connected work** puts a folder's tasks in Notion. Nothing connects by itself: tracking stays **standard** (the folder's own issues or checklist, with no brain and no Notion needed) until you say "connect this work to Notion" in that folder. The agent asks for the gaps only:
- the existing **Project or Area** the work belongs to;
- the **work type**: Software (ready for review when the checks pass and a PR is open; done when it is merged and its criteria are met) or General (ready for approval when its criteria are met; done when you accept it);
- the **logging level**, which says what besides the tasks reaches Notion: **Tasks only**, **Tasks + final outputs** (the suggestion: final deliverables once you approve them), **Full durable record** (also briefs, plans, specifications and decisions), or **Custom**. Drafts and logs stay local unless you say "publish this one"; "keep this one local" holds back a single item.

These settings are the **Workflow**, **Work type**, **Logging level** and **Log artifacts** properties on the Project or Area: change them there at any time, and they apply to future work. Setting **Workflow** to Standard pauses the connection; Connected resumes it.

A project that already has a plan, issues or Notion tasks is **adopted**: say "adopt this project". The agent shows one preview (what it will create, what stays where it is, how each status maps, what happens to the originals, and any of the project's rules that clash) and applies it only after your yes. Done work stays in the plan unless you ask for it. The plan file is never edited, issues are kept unless you choose to mark them transferred, and running adoption again creates nothing twice.

While you work, Notion owns each task's status: what you set there wins. Each task page has a **Work record** toggle (scope, acceptance criteria, recent progress), and the Project or Area page a **Workflow** toggle with a dated summary: done, open and waiting, what isn't in Notion yet, and what needs you. If Notion is down or a write fails, the work is kept and retried in the next session without creating a second task; until then the summary says "not yet in Notion". "end the workflow" stops it for good; the history stays in the brain.

---

## How the brain talks to you

Your agent follows a **response style** you choose: how much it explains, how long its answers are, and what comes first. Setup asks once, on the settings screen ("How the brain talks to you"), and you can change it any time by saying so.

- **Standard** (the default) is how the agent talks out of the box: it defines a new term once, gives answers of normal length, and gives the context before the answer.
- **Simple:** plain words with no jargon (a term it needs comes with a short example), short answers (at most five items at a time; say "more" for the rest), and the answer or the next action on the first line, with where you are ("step 3 of 5") in work with several steps.
- **Custom:** you choose each of the three on its own. "Shorter answers" on top of Simple keeps the rest of Simple.

Say "talk to me more simply", "shorter answers", "more detail", "skip the jargon", "get to the point", or "go back to normal" for Standard. The agent saves it in your brain's settings, says in one line what changed, and answers that way from its next reply. Folders you linked follow the next time you run `brain link` there; a linked project registered in the brain also follows at the next `brain upgrade`. Ask in a session in your brain folder: a linked folder reads the brain but doesn't change it.

The style covers what the agent says to you in its own words. Reports and summaries a command produces are shown as they are. Some rules hold whatever the style: no "Great question!" or "Let me know if…", an error comes with its cause and its fix, and a reply that leaves something open ends with the one next action.

---

## What to say to your agent

Run these in Claude Code or Codex, from your brain's folder.

| You want to | Say |
|---|---|
| Do everything that's waiting: decided reviews, reviewed meetings, new captures, the drop folder | "catch up". It asks all its questions once at the start, then finishes |
| Have it run by itself | "run catch-up every morning" (or "twice a day", "on weekdays"); "what is scheduled?"; "stop the scheduled catch-up" |
| Get reviewed meetings into the brain | "ingest my reviewed meetings" |
| Ingest a file, web page, email or chat | "ingest this PDF: <path>", "ingest this page: <url>", "ingest this email" (then paste it) |
| Process quick captures | "process my inbox" |
| Process the files in your drop folder | "process my drop folder" |
| Apply your Review decisions | "apply my reviews" |
| Bring Notion edits and new rows into the brain, and publish its changes | "sync with Notion" |
| Ask what the brain knows | "what did we decide about …?", "who is …?", "when is the … launch?" |
| Get a report on a subject: where it stands, a timeline, decisions, open questions, people and gaps | "report on the Acme launch". It includes notes you haven't reviewed, marked *(not reviewed)*, and is published to Documents as a report. "refresh the Acme launch report" rewrites it as of today |
| Keep a document, or part of one, as a page | "keep the Acme brief as a document", "also keep the budget from the Acme doc" (or click **Keep as document** on its Inbox row) |
| Turn a decision into a page you write in | "promote Use Supabase for auth to a document" (or click **Promote to document** on it) |
| Turn a module on or off | "turn on documents", "turn planning off", "which modules do I have?" |
| Read a repo into the brain | "link the repo at <path>"; "what is linked?", "check my linked repos", "show the repo's tasks", "change what the brain reads in <repo>", "unlink <repo>" |
| Start a new repo for a project | "start a new repo for <project> at <path>" |
| Track a folder's work in Notion | "connect this work to Notion" (new work), "adopt this project" (a project with a plan or issues already), from the folder of the work |
| Work on it | "let's work on the next task", "publish the plan", "keep this one local", "end the workflow" |
| See what's overdue, stalled, missing a next step or misplaced, and decide what to do | "review my projects", "what's stalled in Clients?", then "yes 1, 2b", "propose 5", "skip 4 because …", "done" (or `claude --agent ultimate-assistant`) |
| Get what's on your mind into tasks, projects and captures | tell Ultimate Assistant in a few sentences, then "yes to all" |
| Find contradictions, out-of-date facts, duplicate notes and recurring themes, and decide what to do | "tidy the brain", "any duplicates?", then "yes 2", "1a", "later 4", "skip 5 because …", "done" |
| Ask how the system works | "how do I …?", "why didn't … ?" (or ask Brain Assistant in Notion) |
| Change how the agent talks to you | "talk to me more simply", "shorter answers", "more detail", "get to the point", "go back to normal" |
| Change the Notion structure (a property, an option, a view) | "add a property to Projects …". Structure is changed in the product first, then in Notion |
| Check your Notion space | "check my Notion space" |
| Update the brain software | `npm install -g ultimate-brain@latest`, then "run brain upgrade" |

---

## When something looks wrong

| What you see | Why | What to do |
|---|---|---|
| A meeting wasn't ingested | It is still Not Reviewed or Skipped, or no ingest has run since you marked it | Set it to **Reviewed**, then "ingest my reviewed meetings" |
| A meeting you created for next week sits in Upcoming | Future meetings stay out of the review queue | Nothing; it moves to To review after its date |
| Text you typed in a project's Brief disappeared | The brain rewrites Brief and Decision log on every sync | Put your notes in **My notes** |
| Your edit to a Summary or Role changed back | Brain-owned fields are read as corrections only on the next sync | "sync with Notion" before the next ingest |
| A new project or person isn't in the brain | It is imported on the next sync | "sync with Notion" |
| A rejected change came back | A later source said it again | Reject it again, or Fix it to the true value |
| A record shows Draft | You haven't reviewed it yet | Read it; set **Reviewed**, or **Disputed** if it's wrong |
| A new decision or question isn't in its database | It waits in its Review notes row | Approve it there, then "catch up" |
| An Area page doesn't list a decision | A decision's Area comes from its project | Link the decision's project to the area, then "sync with Notion" |
| A Review row with What to fix is still pending | The agent couldn't tell what it meant, or it described a different change | Answer the agent's question, or look for the new row it proposed |
| A Fix row is still pending | What to fix is empty | Say what's wrong in What to fix |
| A row "Deferred from …" appeared | You approved a row "all except …": the items you left out wait there | Decide it like any other row |
| A capture wasn't taken in | It is still **New**: the brain takes in only Ready rows | Set it to **Ready**, then "catch up" |
| You fixed the minutes after the ingest, and nothing changed | The meeting is still Ingested | Set it back to **Reviewed**, then "catch up" |
| You want to see what the brain made from a document | Every input has a row in Knowledge → Inbox → What came in?, and on its project's page | Open the row: the body has the digest, and Decisions, Questions, Documents and People list what it produced |
| A Brief says "Nothing reviewed yet" | Its notes are still Draft | Approve their Review notes rows, then "catch up" |
| A document's row shows only the digest | Inbox rows get a digest; the whole text lives in a Document | Click **Keep as document** on the row, then "catch up" |
| A capture is Done but produced nothing | It repeats a source the brain already has; its Summary says "Skipped: same as …" | Nothing, or say "ingest it anyway" if it adds something |
| A button's box stays ticked | No catch-up has run since, or the module is off | "catch up"; if the report says the module is off, "turn on documents" (or reports) |
| Goals, Tasks or Documents aren't updated any more | Their module is off | "which modules do I have?", then "turn on …" |
| A file attached to a capture wasn't read | Its format can't be read, or the file is broken | The catch-up's Check line names the file and the fix |
