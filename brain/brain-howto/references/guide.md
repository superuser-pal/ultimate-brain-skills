# How your brain works

For the daily routine, copyable requests, Notion buttons and Notion AI prompts, start with the [Everyday Guide](everyday-guide.md).

Your second brain has three parts:
- **The brain itself:** Markdown notes in a private Git repo. It's the source of truth: every fact traces back to a meeting or document, and history is kept.
- **Notion:** where you look at the brain and act on it: your tasks, meetings, captures and projects.
- **Your agent** (Claude Code or Codex): does the work, and is where you decide. It reads your meetings and documents, asks you what it needs decided, writes notes and publishes them to Notion.

You never edit the Markdown by hand. You work in Notion and talk to your agent.

**Modules.** The space is a core you always have (Inbox, Meetings, Projects, Areas, People) plus the modules you choose:

| Module | Adds | On for a new brain |
|---|---|---|
| **Domains** | Group Areas by work or life context | no |
| **Orgs** | Client and partner organizations | yes |
| **Documents** | A document, or part of one, kept as a page you can read, and what the brain learned (ideas, methods, definitions) | no |
| **Reports** | Ask the brain in the Inbox, and get a report in Documents you can refresh (needs Documents) | no |
| **Tasks** | Action items as Notion tasks, and the questions and risks you follow up | no |
| **Planning** | Goals and Key Results | no |

Decisions and open questions are in every brain: they show in each project's and Area's **Brief** and **Decision log**, and have no database of their own (since 0.16.0). Change the modules any time by asking your agent: "turn on documents", "I don't use goals, turn planning off", "which modules do I have?". Turning one on walks you through its Notion steps; turning one off deletes nothing, and the brain simply stops reading and writing its databases. This guide describes every module; skip what you haven't turned on.

**Where the Notion build files are.** The checklist that builds your space (`notion/CHECKLIST.md`), its Notion AI prompts, each module's steps and the migrations for a space an earlier release built are installed with the CLI. `brain status --json` names their folder as `product.path`; with a global install it is `$(npm root -g)/ultimate-brain`, so the checklist is `$(npm root -g)/ultimate-brain/notion/CHECKLIST.md`. Your agent names the full path whenever it sends you to one.

---

## The Spaces

The navigation on the left of every page lists the Spaces. Each one has tabs that run from *now*, to *later*, to *done*.

| Space | Use it to | Tabs |
|---|---|---|
| **Home** | Start your day | Buttons (Quick capture, Ask the brain, New meeting, New project) · "What's on today?" (Areas: one line per area, like "Agency · 4 to review · 1 meeting", or "all clear"; Tasks; Meetings; Projects; Inbox: captures New or Ready) · "Needs you": minutes to review · "What did the brain take in?" (Came in, Meetings) |
| **Tasks** | Do the work | Today · Upcoming · No date · Waiting On · Someday · Questions · Risks · Done |
| **Meetings** | Prepare meetings and get minutes into the brain | Upcoming · To review · Ready for the brain · Ingested this week · Calendar |
| **Projects** | Keep projects moving | Active · By area · Deadlines · Gone quiet |
| **Plan** | Check that your work serves your goals | Goals · Key results · Areas · Projects by goal |
| **Knowledge** | Find what the brain knows, and everything that came in | Documents · People · Orgs · Inbox (What came in?: everything ingested, with what it produced; the captures still waiting are in Home's Inbox tab) |
| **Archive** (linked from System) | Find finished and archived records | One tab per database |

**Area pages** collect everything for one area: its goals, projects, tasks and meetings in views, and its people and clients as lists at the top. The brain adds a **Brief** toggle at the end: the area's projects with their status, and its recent decisions and open questions. Open one from Plan → Areas.

**Project pages** show the Brief (with the open questions and risks) and Decision log (written by the brain), then the project's tasks, meetings and people, "What came in?" (every input filed under the project), "What do we know?" (its Documents) and **Reports** (the project's reports), then your own "My notes".

**A Brief shows only what you accepted.** Decisions and questions still in Draft stay out of it until you accept them in your agent's chat. When a section has nothing accepted yet, it says how many notes are waiting.

---

## The meeting flow

Every meeting moves through **Brain Status**:

1. **Before the meeting (optional):** create it with **New meeting** on Home. It appears in Meetings → Upcoming. Ask Notion AI to prepare you for it.
2. **During the meeting:** Notion AI takes the notes on the meeting page (or another tool writes the transcript there).
3. **After the meeting:** the meeting appears in Meetings → To review (status **Not Reviewed**). Work through the "Before marking Reviewed" checklist on the page:
   - attendees linked;
   - project linked;
   - minutes follow the format;
   - minutes checked and corrected.

   Check the minutes, fix them, tick the quick follow-ups you've already done, then set Brain Status to **Reviewed**. What the minutes get wrong, fix here: it's cheaper than fixing what the brain read from them.
4. **Ingest:** tell your agent "ingest my reviewed meetings" (or "catch up"). The brain reads the minutes and shows you what came in, one subject at a time ("Deciding in the chat", below). After your answers it writes, and sets the meeting to **Ingested**:
   - what you accepted goes in: new decisions, questions and Documents, additions and links, the changes you said yes to, an answer it found to one of your open questions;
   - what you left for later waits for "what needs my decision"; new people arrive as **Draft** straight away, so the meeting can list them;
   - action items become **Tasks** (status To Do). Only the brain creates a meeting's Tasks, once: don't ask Notion AI or a notetaker to create them too.
5. Set **Skipped** for a meeting the brain should never read.
6. **Fixed the minutes after the brain read them?** Set Brain Status back to **Reviewed**. The next catch-up reads the meeting again, compares it with what it read before, and asks you only about what changed. The earlier version stays in the brain's history.

The brain only ingests meetings you marked **Reviewed**, and only when you ask: nothing runs on its own. It never edits the meeting page itself.

**Why isn't my meeting in "To review"?** Meetings dated in the future stay in Upcoming until their date has passed.

---

## Choosing what enters the brain

Meeting minutes (notion/minutes-format.md; ask Brain Assistant to "check minutes") are a short summary for you: **In one line**, your **Quick follow-ups** (checkboxes tagged `[q1]`, `[q2]`, …), the **Tasks for the brain**, then one block per subject whose lines start `Decided:`, `Open:`, `Concern:`, `Waiting on <name>:` or `Idea:` and end with an id like `[s2.i3]`. A collapsed toggle **For the brain** at the end holds the Attendees and Projects, each subject's line `[s2] Selection: Use in brain`, and the quotes from the transcript behind each line. Correct a summary line and the brain reads your wording; keep its tag at the end. A voice note ("Voice summary") is written as **subjects**, each with a line `Selection: Use in brain`, and **items**, one line each with an id and a short quote from the transcript. Everything is included unless you mark it:

- **Where the transcript and the minutes go:** the transcript stays on the meeting page, in the meeting-notes block's Transcript when Notion recorded the meeting, or in the page body when you paste it. Run the minutes prompt in the Notion AI chat on the page, with the line "Write the minutes on this page, below the transcript, and nothing else." The minutes then land below it. A meeting with minutes but no transcript isn't ingested: the agent leaves it Reviewed and asks you to put the transcript back above the minutes (Notion's version history, or paste it again).
- **Leave a subject out:** change its line to `Selection: Meeting only` (in a meeting, that line is in **For the brain**). It stays on your Notion page and out of the brain.
- **Leave one item out:** in a meeting, open **For the brain** and write `Meeting only:` at the start of its quote line (`Meeting only: [s2.i3] "…"`); in a voice note, at the start of the item. **Keep one inside an excluded subject:** write `Use in brain:` in the same place. In a meeting, never write them on a summary line: there they block the meeting, and the brain says why.
- **Confirm:** set the meeting to **Reviewed** (a voice note or capture to **Ready**). Until then nothing is ingested, and the brain never confirms for you. Reviewed confirms what you can see on the page when the next run reads it.
- The brain keeps only the **paragraphs** of the transcript your selection includes, not the whole transcript. A paragraph shared by an included and an excluded item stays out; the agent tells you which two items collide and proposes tighter quotes.
- **Tasks:** only your own explicit commitments become Tasks. Someone else's commitment becomes a Waiting On task only when you write `Track: Waiting On —` before that item. The same token on a question or a risk makes a Waiting On task that follows it up, with Kind Question or Risk. A vague idea ("we could…") never becomes a task.
- **Questions** are only what a later meeting or document can answer. A to-do is never filed as a question (0.9.1): yours becomes a task, someone else's stays in the meeting's text. If older open questions are really to-dos, say "turn my to-do questions into tasks": the brain lists them, and on your yes turns yours into tasks and drops the others; then it offers, one at a time, to follow up each real open question as a task. An open question stays in its project's Brief; say "track the … question" to follow it up as a task (Kind Question, on the Tasks page). When that task is Done, the brain asks whether the question is answered.
- **Quick follow-ups and Tasks:** your own actions come in two groups. **Quick follow-ups** (a link to send, a call to book) are checkboxes. Tick the follow-ups you've done before you mark the meeting Reviewed: each one still unticked becomes a Task with the meeting's projects and no due date (with the Tasks module off, they stay on the page); tick or delete one to keep it out. The brain never ticks or edits a checkbox, never creates the same follow-up twice, and keeps a follow-up's text out of its notes. Each item under **Tasks for the brain** has a **Scope** toggle: edit Done when, Due, Project and Notes before you mark the meeting Reviewed, and the Task is created with them.
- **Minutes written with an earlier prompt** (before 0.14.0) are read as before: `Meeting only:` and `Use in brain:` go at the start of the item, and their quick follow-ups stay on the meeting page and never become Tasks.
- **Quotes:** a quote that is too long or slightly reworded no longer blocks the meeting; the agent tells you which item it couldn't place. Only a quote under something marked Meeting only must match the transcript exactly.
- **Changed your mind later?** Edit the tokens and set the meeting back to Reviewed (or the capture to Ready), or tell your agent. Deleting a line on its own is not a request: the brain keeps what it has until you ask. When something is taken out, the brain asks you, in the chat, about what already rests on it: **Remove**, **Restore** (a paragraph is back) or **Keep or Remove** for a note that cannot be tied to a passage. Turning it down releases nothing; Tasks made from excluded content are listed for you to act on and are never cancelled by the brain.

---

## Deciding in the chat

**Every decision is made in your agent's chat** (Claude Code or Codex), never in Notion (since 0.16.0). Accepting makes the brain's notes **trusted**: accepted notes appear in your Briefs and in the brain's answers; until then the brain treats them as unconfirmed. The brain never changes what it already knows without your yes.

**When something comes in** (a meeting, a capture, a document), the agent shows it **one subject at a time**, for example a project:

```
Part 1 of 2: Pilot rollout
  Pilot scope: 3 regions, starts in March (decision, Oct)
  9 depots in the pilot

  Adding
  + Kickoff date moved to 4 March (new fact)
  + Risk: driver shortage in the north (new note)

  Q1. Depot count: 9 today, the document says 11
      a) 11 (recommended: the document is newer)  b) keep 9  c) later
  → The rest of part 1 (the 2 additions): accept?
```

First a short view of what the brain already has on the subject, then what is added (`+` lines), then the questions about anything it would replace or isn't sure of, each with lettered options and the one it recommends, then the part's yes. Answer with letters ("1a") or in your own words ("11, but say depots, not sites"). For the part: **yes**, **"all except …"**, **no**, or **later**. **"Enough"** leaves the rest waiting; **"stop"** writes nothing, and the input stays as it is in Notion for the next run. Nothing is written until you have answered.

**What waits.** What you leave for later, what a scheduled run brought in while you were away, and what the weekly review, "tidy the brain" or Ultimate Assistant left for later all wait for you. Say **"what needs my decision"** (a catch-up also ends with it): the agent asks at most **five questions a round**, the most important first:
1. changes to what the brain holds: **your edits in Notion** to a value the brain owns come first, all in one question ("3 corrections from Notion: accept all, all except …, or reject?"), then changed facts, a decision replacing another, a moved note;
2. merges, answers to your open questions, possible duplicates, a question whose task you finished;
3. a source's new notes and additions, one question per source, listing its subjects.

"More" asks the next round; "enough" stops, and the rest keeps waiting.

**Your edits in Notion** to a Summary, a Role, a Key Fact or another value the brain owns are asked before they go in, because the brain can't tell your edit from one made by Notion AI or another tool. Turning one down puts the brain's value back in Notion at the next publish; until you answer, your edit stays as it is in Notion.

**A question you follow up as a task.** When its task is **Done**, the agent asks: a) the question is answered (say the answer), b) drop the question, c) keep it open. The same for a task set to **Won't Do**, one moved to Notion's trash (keeping it open unlinks the task, so you can track it again), or one the brain can't see any more (deleted, or no longer shared with the brain). When a meeting or document answers a question that has a task, the agent asks whether to record the answer and set the task Done.

**Corrections are yours and attributed.** If you correct a fact (March 15 to March 18), your value becomes current and the brain records it as your correction; the source's value stays in the history, attributed to the source.

A turned-down change can come back if a later meeting says the same thing again. An item that rests only on content you excluded is closed without applying anything.

---

## Correcting what came in

**How do I correct what came from a meeting?** It depends on where the mistake is:
- **The minutes are wrong** (a misheard name, a wrong date): fix the minutes on the meeting page, then set Brain Status back to **Reviewed**. The next catch-up reads the meeting again and asks you only about what changed. The same goes for a capture: fix its text and set its Brain Status to **Ready**.
- **The minutes are right, but the brain read them wrong** (the wrong project, a suggestion taken as a decision): say so when it asks ("that's a suggestion, not a decision", "it belongs to Acme app"), and it redrafts and asks again. If it's already in, tell your agent what's wrong ("that's wrong: …"), or set the note's Lifecycle to **Disputed**.

**How do I refresh a report?** Two ways. **Click Refresh report** on the report's page in Documents: Brain Assistant adds one toggle at the end of the page, "Proposed refresh · based on Notion", with a new version written from the brain's Notion pages (the report's own text stays as it is, and a second click replaces only the toggle). To use it, replace the report text with what is in the toggle, delete the toggle, and click **Accept**; the next "catch up" shows you what changes and takes it in. **Or** tick **Refresh asked** by hand (or say "refresh the Acme launch report") to have the brain rewrite it from its notes in Git; it waits while a proposed refresh or an unaccepted edit is on the page. A new **Ask the brain** row always makes a new report. The earlier versions stay in the brain's history.

**What does accepting do?** Brain Assistant's text lives in Notion until you accept it. Click **Accept** when the text is final. The next catch-up compares the page with the brain, shows you exactly what will replace the brain's version, and takes it in after you say yes. Nothing is taken in while a "Proposed revision" or "Proposed refresh" toggle is still on the page, and if you edit the page after clicking Accept, click it again: an edit made in a later minute cancels the acceptance. (An edit in the same minute as your click, before the catch-up first reads the page, cannot be noticed, so leave the page alone for that minute.) A scheduled run takes in an acceptance only if it is at least two minutes old. The catch-up may also propose a "Related knowledge" list for a Document, asked with what needs your decision; for a report it only tells you what the brain knows that the refresh does not.

**A report says something wrong?** Write it in the report's **What to fix** (on its page in Documents) ("Lucía left Acme in June"). The mistake lives in the notes the report rests on, so the next catch-up turns it into changes on those notes, asked in the chat. Once you've decided them, it refreshes the report.

---

## What you can edit, and what the brain owns

Hover over a property name to see its owner. Each description starts with "Owner: you", "Owner: brain" or "Owner: system".

| Owner | Examples | What happens when you edit it |
|---|---|---|
| **You** | Status, Priority, Dates, Lifecycle, Archived, a report's What to fix, Brain Status on meetings, Project, Area, Kind and Only keep on an Inbox row, the text of a changed version (Kind Changed) before it goes in, the buttons and the boxes they tick (Document asked; Refresh asked, ticked by hand), Accepted and Accepted at (set by the Accept button) | Your value stands. The brain reads it but never overwrites it; it unticks a button's box and clears a report's What to fix once it has acted on them, and sets a row it took in to Done. It fills Kind only when you left it empty |
| **Brain** | Summary, Role, Client, Key Facts, Why, Assessment | The next sync reads your edit as a **correction** and your agent asks you before it goes in (the brain can't tell your edit from one made by Notion AI or another tool). Once accepted, names, summaries and relations change in place and a key fact gets a dated history entry; turned down, the brain's value goes back. Judgments such as Assessment can't be edited: tell your agent |
| **System** | Brain ID, Last Synced, Ingested At | Don't edit. The brain uses them to match records |

**Page text:**
- **Brief and Decision log** on project pages, and the **Brief** on area pages, are rewritten by the brain on every sync. Anything you type inside them is lost.
- **My notes**, and everything else on a page, is yours.
- Decisions and questions have no page of their own: they show in the project's or Area's Brief and Decision log, written by the brain. A Document's page is written by the brain too, except a promoted one ("Buttons" below): its text is yours once it's made.
- A capture's text is yours; the brain only adds its Kind, Summary and what it produced. An Ask row's text is yours too.
- **Inbox rows the brain creates** (a document, email, web page, a repo file) get a **digest** in their body: what the input is, a summary and the key points, with figures and dates as stated. It is written once and never read back, so an edit you make there stays in Notion. To read the whole input in Notion, keep it as a Document ("Buttons" below). The original file is the real copy. A **Full text** toggle on an older row stays as it is.
- A task that follows up a question (Kind Question or Risk) is yours like any task: when you set it Done or Won't Do, your agent asks whether the question is answered. The brain sets it Done itself only after your yes, when a meeting or document answers the question.

**Lifecycle** tells you how far to trust a record:
- **Draft:** new, not accepted by you yet (people only: a new decision, question or Document waits for your yes in the chat instead);
- **Reviewed:** you checked it, usually by accepting its part in the chat;
- **Disputed:** you think it's wrong;
- **Archived:** no longer current.

Only People and Documents show it in Notion (decisions and questions have it in the brain): the brain writes those from what it reads. Domains, Areas, Goals, Projects and Orgs are yours from the start, so they have none; close one with **Archived**.

Set **Disputed** on anything wrong. The brain stops relying on it, and you can ask your agent to fix it.

---

## The Inbox and its buttons

Every Inbox row moves through **Brain Status**: **New → Ready → Done**.
- **New:** a row you created by hand. The brain leaves it alone.
- **Ready:** the brain takes it in at the next "catch up". **Quick capture** creates its row as Ready.
- **Done:** the brain took it in, or skipped it and says why in Summary ("Skipped: same as Acme requirements"). Rows the brain creates for documents, emails and web pages start as Done.

A **changed version** (Kind Changed) is the one row the brain creates as **New**: a document you asked to change before it goes in, waiting for your check ("Changing a document before it goes in" below).

**Buttons** ask the brain for something. Each ticks a box on the same row, which reads as "waiting for the brain"; the next "catch up" acts on it and unticks it.

| Button | On | Ticks | The brain then |
|---|---|---|---|
| **Keep as document** | Inbox rows | Document asked (and sets the row to Ready) | Keeps the row's file, or its text when it has no file, as a **Document**, whole. With **Only keep** filled ("just the requirements table"), it first writes that part as a changed version for you to check, and only that part goes in |
| **Keep as document** | Tasks | Document asked | Keeps the task's page as a **Document**, word for word, linked to its project or area and to the question it tracks, then asks you what to add **From the brain** |
| **Refresh report** | Reports (Documents) | nothing (it sends a message to Brain Assistant) | Proposes a refreshed version in a toggle, based on the brain's Notion pages; you accept it with **Accept** |
| **Tidy capture** | Inbox rows of Kind Capture, Brain Status New | nothing (it sends a message to Brain Assistant) | Rewrites the capture's text as clear sentences, keeping every name, number, date and quote; the row stays New, and you set Ready afterwards |
| **Write up** | Documents (promoted ones) | nothing (it sends a message to Brain Assistant) | Develops the page into Purpose, Main content, Open questions and Sources, from the brain pages it links; a second click keeps your edits and adds a "Proposed revision" toggle |
| **Accept** | Documents (a write-up or a report) | Accepted and Accepted at | Marks the page text as final. The next catch-up shows you the change against Git and, once you say yes, puts exactly that text in the brain and unticks the box |

**Documents** (the Documents module). A Document is a page you read, linked to its source, project and area:
- **the whole input:** the text exactly as it came in. It needs no review and is Reviewed straight away;
- **a changed version you checked** (Only keep set, or "keep only the budget from the Acme doc"): the part you asked for, first written to your Inbox for you to check; once you say *go* or set it Ready, its text goes in whole, word for word, and is Reviewed;
- **a task** you kept (Keep as document on the task, or "keep the go-live task as a document"): the task's page, word for word, with a **From the brain** section at the end holding only the lines you said yes to;
- **learned:** an idea, method or definition the brain learned from what it read (a concept before 0.9.1). It waits for your yes in the chat, like a new note, and gets its page when you accept it;
- **promoted** from a decision: say "promote the decision on … to a document" to your agent. It starts from the note, then you write in it.

The brain still reads every input for decisions, questions and people, whether or not you keep it as a Document. A new version of the file later proposes only the lines that changed.

---

## Changing a document before it goes in

Meetings have Check minutes and captures have Tidy capture. A document (a file, an email, a web page, a pasted text) gets its check this way: ask your agent to change it before it goes in.

- **Ask in the chat:** "take in ops-plan.pdf, but keep only the pilot section, and the depot count is 11, not 9". Or click **Keep as document** with **Only keep** filled.
- **The brain takes nothing in yet.** It keeps the original as a source and writes the changed text to a new Inbox row, **Ops plan (changed)**, Brain Status New. Its **What changed** lists what was left out or altered (`Dropped: Hiring (section 3)`, `Altered: depot count 9 → 11`), and **Changed from** links the original's row.
- **Check it in Notion,** and edit its text if you want. It is your version.
- **Then say "go"** in the chat: the brain takes in the row as it is now, one subject at a time, as for any input. Or set the row **Ready**: the next catch-up takes it in, and a scheduled one leaves its notes Draft and its questions for your next session (Ready approves the text, not the notes).
- **What goes in cites your version.** The original stays linked, so everything can be traced back, and it is never taken in on its own. To take in the whole original after all, say so: the brain moves the changed row to the trash and takes in the original.
- **Changed your mind?** Delete the row; nothing else changes. Until you check it, the catch-up reminds you: "1 changed document to check".

**Keeping a task as a document.** What you gathered on a task (the research for it, the answer to the question it tracks) can become a Document: click **Keep as document** on the task, or say "keep the go-live task as a document". The task's page is kept word for word, linked to its project or area, the question it tracks and the task. Then the brain offers what it already holds on the subject ("From the brain, add to its end? a) The site goes live on 4 March … b) …"), and adds only the lines you say yes to, in a **From the brain** section at the end. Your text above it never changes. A scheduled run keeps the task and leaves the From the brain question for your next session. Kept again after you edit the page, it asks before replacing the Document. Needs the Documents module.

---

## Adding things

| You want to add | Do this |
|---|---|
| A quick thought, link or idea | **Quick capture** on Home. It lands in the Inbox (Home → What's on today? → Inbox) as **Ready**. Set its **Project** if you know it, so the agent doesn't ask. A row you create by hand starts as **New**: set it to Ready when it's ready. Then "catch up" (or "process my inbox") |
| A meeting | **New meeting** on Home, or let Notion AI create it when it starts taking notes |
| A project, area, goal, person or org | Create the row in Notion (**New project** on Home for projects). The next sync imports it into the brain. Or ask the agent for a new project: it writes the note and the publish creates the page from the Projects template |
| A document (PDF, Word, PowerPoint, Excel, saved HTML page, image) | Put it in your drop folder and tell your agent "process my drop folder". It lists the files and asks once which to take, and, with Documents on, whether to **keep each as a document**: "no" (the default: the brain only reads it), "all", or "only the requirements" (only that part goes in, after you check it: "Changing a document before it goes in"). A new version of a document later proposes only the lines that changed. Then, each ingested file moves to `processed/` inside the folder, so what's left at the top is what the brain hasn't read yet. Or name one file: "ingest this PDF: ~/Documents/brain-dropbox/proposal.pdf". Word, PowerPoint, Excel and HTML files need MarkItDown installed once: `pipx install 'markitdown[all]'` |
| A web page | Give your agent the link: "ingest this page: https://…". For a page behind a login, save it as a PDF in your drop folder instead |
| A file from your phone | Attach it to a **Quick capture** (or to the meeting page), with Project set if you know it. To keep the file itself as a Document, click **Keep as document** (and write in **Only keep** if you want just a part: that part comes back as a changed version for you to check first). The row is Ready; the next catch-up reads the file with the row. Files on project and area pages are not read |
| A repo's knowledge (decisions, docs, changelog) | "link the repo at ~/code/acme-api". The agent proposes a link kit (what to read and never read, where the repo's tasks live, its Area and Project) and writes it into the repo only after your yes ("Projects in other folders" below). Each catch-up then reads the files changed since the last one; the first time, it asks which to take. Apart from the kit, the brain never writes to the repo |
| A question for a full report | **Ask the brain** on Home: type the question as the Name ("Where do we stand with the Acme launch?"). The next catch-up answers with a report in **Documents**, linked from yours, and on the project's or area's page under **Reports**. To bring it up to date later, click **Refresh report** on it ("Correcting what came in"). Needs the Reports module (and Documents) |
| An email, chat thread or note | Paste it into a **Quick capture** (keep who sent it and when). For a thread, ask Brain Assistant to **Run Clean email** on the page: Brain Assistant gives each message a heading with names and date ("Tomás Vidal → Lucía Fernández · 3 Dec 2026"), its own text word for word below it, and a divider before the next, newest first. It drops addresses, signatures, disclaimers, quoted copies and Teams, Zoom or Meet blocks, and rewrites the page right away (the page history keeps the original), asking first only when something is truly unclear. Then set the row to **Ready** and "catch up". Or paste it straight to your agent: "ingest this email" |
| A task | Add it in Tasks. Action items from meetings, and your own from documents, emails and captures, are created for you |

**Tasks:**
- New tasks from the brain start as **To Do**.
- Choose **Won't Do** for work you have dropped. It leaves due views and reminders and stays available to reopen; it is counted separately from completed work. Project progress excludes dropped tasks from its denominator and shows no percentage when no active scope remains.
- **Doing**, **Waiting On**, **Someday** and **Done** are for you; the brain never reads them.
- A task without a due date shows in Tasks → No date.

---

## Ask Brain Assistant in Notion

**Brain Assistant** is a Notion AI agent that reads Ultimate Brain and answers. It never changes your knowledge, and never creates Tasks from a meeting: the brain does, once, when it takes the meeting in. Brain Assistant and its buttons need Business (or Enterprise) with Notion credits. Open its chat (Agents → Brain Assistant, or @mention it on a page) and ask for a skill by its name, or ask a question. Brain Assistant doesn't run a skill typed as a `/` command: say "Run Today", not `/Today`. To point at a skill's page instead, paste its link (open it from your space's Skills database, ••• → Copy link); don't pick it from the `@` picker, which can offer another space's page of the same name.

| Ask | You get |
|---|---|
| "Run Today" | What's due today and today's meetings |
| "Run Check minutes" (on a meeting page) | Missing sections and names and numbers to confirm; fixes the text after you say yes |
| "Run Prep" (on a meeting page) | Past meetings, open questions, tasks and recent decisions for that meeting |
| "Run Weekly review" | This week's weekly review (the Inbox row **Week of …**): a short summary of what changed and your task analysis, then its items explained. It decides nothing and writes nothing: it tells you which tasks to change (you set them) and that the rest is decided with your agent ("what needs my decision"). With no review this week, it says how to get one (say "weekly review" to your agent, or turn on the Monday schedule) |
| "Run Plan check" | Projects without goals, goals without projects, overdue items |
| "Run Tidy capture" (on a new capture in the Inbox; also the **Tidy capture** button) | A cleaner version of the capture; replaces the text after you say yes (the button carries the yes) |
| "Run Clean email" (on a new capture holding a pasted email thread) | Each message under a heading of names and date, its own text word for word, a divider between messages, newest first; no addresses, signatures, disclaimers, quoted copies or meeting blocks; rewrites the page directly and asks only on a serious doubt |
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
Answer with "yes 1, 2b", a change ("1: due Friday"), "skip 4 because …", or "propose 5" to decide it later; "done" to finish.
```

**What it checks,** with the same thresholds for everyone: a task 3 or more days past its due date (overdue) or not edited for 14 days (stalled); an Active project with nothing done or mentioned in the brain for 21 days, with no next step, or with every task done but still open; a project whose notes mostly sit in another Area; two projects that look like the same one; an Area with nothing active, or with no Domain. Tasks set to Waiting On or Someday aren't nagged about. It shows the 10 most important findings, worst first, and "more" shows the next ones.

**It changes nothing without your yes.** You answer in the chat:
- **"yes 1, 2b"** makes those changes now: "yes 1" is the first suggestion (a), "2b" the second. "yes to all" takes every a). When a change needs something from you (a new due date, which Domain), it asks first. You can also say the change yourself: "1: due Friday", "3: mark it Waiting On".
- **"propose 5"** leaves the change waiting instead, so you can decide it later: "what needs my decision" asks it. Once you accept it, the change is made.
- **"skip 4 because it's a personal area"** stops it being flagged. When a status says why (a task Waiting On or Someday, a project On Hold), it offers to set it; otherwise it remembers the skip for 30 days, with your reason. "show the skipped ones" lists them, and "unskip s2" brings one back. Turning down a proposed change counts as a skip for 30 days too.
- **"done"** ends the session: it tidies up, saves your brain and backs it up (or reminds you to), and says what changed.

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
- **A theme** becomes a draft Document, citing the meetings and sources behind it, that you accept like any new note ("what needs my decision").
- **"later 4"** leaves it waiting instead, for "what needs my decision".
- **"skip 5 because …"** hides it. A skipped merge stays skipped: two notes you said are different stay different. A skipped contradiction, stale fact or rule comes back only when a newer meeting or source mentions that note, and a skipped theme only when more meetings discuss it. Turning it down later counts as a skip too.
- **"done"** ends the session: it publishes what changed and says so: "Done: 3 changed, 1 waiting, 1 skipped, 1 drafted."

It runs only when you ask. When nothing needs tidying it says "Nothing to tidy." and writes nothing. Ultimate Assistant's sub-agent runs it too: `claude --agent ultimate-assistant`, then "tidy the brain".

---

## The weekly review

Once a week, one short report on your work and your notes: what changed since the last review, where your tasks stand, and at most five decisions. Say "weekly review" to your agent, or have it run every Monday at 08:00 (below). It reads Tasks, Projects and Areas live from Notion and your brain's notes, and saves the review in your brain under `reports/`, one file per week, published as one Inbox row, **Week of 9 Nov 2026** (Kind Weekly):

```text
Week of 9 Nov 2026 · changes since Mon 2 Nov 08:04 · Notion read live
Covered: 14 changes from 6 meetings and 3 sources. 2 more decisions wait from earlier weeks.

## What changed
- **Decided:** launch the Harbor app in March, not January (Launch Harbor app in March, 4 Nov).
- **Changed:** Quarry website's budget is 18k, was 12k (Quarry kickoff, 5 Nov) *(not reviewed)*.
- **Next:** send the Quarry estimate (task, 13 Nov).

## Task analysis
- **Overdue:** "Send the logo proposals" (Harbor app), 8 days late.
- **Stalled:** Pinecrest signage (project): nothing done or mentioned for 40 days.

Order of attention:
1. Send the logo proposals: the client meeting on Thursday depends on them.

## What needs your decision
1. Correction · Quarry budget 12k → 18k · 3 notes restate 12k → decide in the session (2 of 3 shown)
2. Overdue · "Send the logo proposals" · new date, Done or Won't Do → the task
3. Stalled · Pinecrest signage · set On Hold? → decide in the session

5 more findings wait for next week. Say "weekly review more" in a session for the rest.
```

**It decides nothing.** A proposal is decided with your agent: say "what needs my decision" (right after the review, or any time). A **task** item is set on the task itself in Notion (a new date, Done or Won't Do). In Notion, the week's Inbox row says "decide in Claude Code or Codex" for each proposal, and Brain Assistant's "Run Weekly review" reads it with you without deciding.

**Five at most, and no nagging.** A week shows at most five decisions, five new proposals and five notes or tasks they would change, across your work and your notes, corrections first, then overdue and stalled work, then tidying. The rest waits for next week ("weekly review more" shows it now). A finding shown before comes back only when its evidence changed, it became overdue, it got much later, or it is a contradiction in a reviewed note that is still open. What you skipped or rejected stays skipped. A week with nothing new writes nothing at all: no empty page.

**Corrections.** When you approve a corrected fact (a budget, a date, a renamed project), the next review finds the notes that still say the old value and proposes fixing them together, as one question whose changes you pick one by one. Meetings, decisions and sources are never changed: they are the record. A line it can't settle is named as needing clarification, not changed. "weekly review corrections" goes through every waiting check at once.

**Review my week every Monday.** Say "review my week every Monday" and the agent sets it up: the time (Monday 08:00 unless you say otherwise), the Claude model (Sonnet unless you pick another), what a run may use, and once, publish automatically. Each week's review appears in Notion as the week's Inbox row (with publish automatically on; otherwise at your next session), and your next session tells you it's ready: "This week's review is ready: 4 decisions (Inbox, Week of 9 Nov 2026)." A run is capped (3 USD on Sonnet), and if it runs out of time it says what it didn't check, and checks that first next week. Before the first run, open Claude Code in your brain folder once and accept its trust dialog. "Stop the weekly review" removes it.

---

## Run catch-up on a schedule

Say "run catch-up every morning" (or "twice a day", "on weekdays") and the agent sets it up with you: the times, the Claude model to pin, and what a scheduled run may use. On a Mac it installs a background job; on other systems it gives you a line to add with `crontab -e`. The job runs `claude -p "catch up unattended"` in your brain folder, so your computer has to be on and Claude Code signed in at that time.

**What a scheduled run does.** It takes in what is waiting, up to 10 inputs a run, oldest first (change it with "raise the scheduled budget to 20"), and the rest waits for the next run. It decides nothing: what it takes in waits for your yes, and so do your edits in Notion to the brain's values. Your next "catch up" (or "what needs my decision") asks them, one question per source. A What to fix on a report waits for your next "catch up" too, because turning words into changes is a judgment nobody would check. A meeting or capture that needs a question answered stays where it is (the meeting Reviewed, the row Ready). A run with nothing waiting writes nothing.

**Where you find out what it did.**
- Your next **"catch up"** opens with one line: "Since last time: 4 scheduled runs, 6 inputs in, 1 skipped, 3 decisions waiting, 1 failed: Notion login". It also warns "Backlog growing" when three runs in a row left inputs over: run it more often or raise the budget.
- With **Reports** on and **publish: auto**, a run that needs you or failed also adds one row to the Inbox, of Kind Catch-up ("Catch-up 29 Oct: 2 in, 1 needs you"). A run that went well adds nothing.
- With publish **ask** (the default), a scheduled run saves your brain and backs it up (or reminds you to) but publishes nothing to Notion; your next catch-up publishes. Say "publish automatically" to change that.

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

## Where your work sits

Your agent knows how your work is organised from the start of every session. Your brain's `AGENTS.md` (the instructions every agent reads) has a section **Your structure**: your Domains, the Areas in each, and the active Projects in each, with their ids.

- **You don't edit it.** The brain rewrites it after every change, so a new Area, a renamed Project or one you archive shows up there at the next run. Anything typed inside it is lost; your own rules go under **My rules**.
- **Only active Projects are listed.** A Project you set to Planned, On Hold or Done, or archive, leaves the list; one just created and not yet synced is in it. An Area with no Domain is under **No domain**, and a Project with no Area under **No area**.
- **It doesn't let the agent invent structure.** The agent uses it to place what it writes. It creates a Domain, Area or Project only when you ask, or say yes to its suggestion.
- **To change your structure,** say it to your agent ("add an Area for hiring under the studio") or change it in Notion; the list follows.

**What belongs to a Project or an Area.** Ask "what's in Acme website?" or "what's open in Clients?". The agent reads the page's **Brief**, which lists its recent decisions, open questions, meetings and, when Documents is on, its Documents (an Area's Brief also lists its Projects), and reads the tasks live from Notion each time, so you always get today's status.

**Linked folders** show only their own place: the Project, its Area and the Area's Domain. The block there is committed in that repository, which other people may read, so the rest of your structure stays in your brain.

---

## What to say to your agent

Run these in Claude Code or Codex, from your brain's folder.

| You want to | Say |
|---|---|
| Do everything that's waiting: reviewed meetings, new captures, the drop folder, your edits in Notion | "catch up". It asks what blocks first, then each input's subjects, then what is waiting |
| Have it run by itself | "run catch-up every morning" (or "twice a day", "on weekdays"); "what is scheduled?"; "stop the scheduled catch-up" |
| Get reviewed meetings into the brain | "ingest my reviewed meetings" |
| Ingest a file, web page, email or chat | "ingest this PDF: <path>", "ingest this page: <url>", "ingest this email" (then paste it) |
| Process quick captures | "process my inbox" |
| Process the files in your drop folder | "process my drop folder" |
| Decide what the brain is waiting for | "what needs my decision", then "more" or "enough" |
| Follow up an open question or risk as a task | "track the go-live question" (or write `Track: Waiting On —` on its line in the minutes); "turn my to-do questions into tasks" |
| Bring Notion edits and new rows into the brain, and publish its changes | "sync with Notion" |
| Ask what the brain knows | "what did we decide about …?", "who is …?", "when is the … launch?" |
| Get a report on a subject: where it stands, a timeline, decisions, open questions, people and gaps | "report on the Acme launch". It includes notes you haven't reviewed, marked *(not reviewed)*, and is published to Documents as a report. "refresh the Acme launch report" rewrites it as of today |
| Keep a document, or part of one, as a page | "keep the Acme brief as a document", "keep only the budget from the Acme doc" (or click **Keep as document** on its Inbox row). A part is written to your Inbox to check first |
| Change a document before it goes in | "take in this PDF, but keep only the pilot section", "drop the appendix", "the depot count is 11, not 9"; then check the changed version in your Inbox and say "go" |
| Keep a task's page as a document | "keep the go-live task as a document" (or click **Keep as document** on the task) |
| Turn a decision into a page you write in | "promote Use Supabase for auth to a document" |
| Turn a module on or off | "turn on documents", "turn planning off", "which modules do I have?" |
| Read a repo into the brain | "link the repo at <path>"; "what is linked?", "check my linked repos", "show the repo's tasks", "change what the brain reads in <repo>", "unlink <repo>" |
| Start a new repo for a project | "start a new repo for <project> at <path>" |
| Track a folder's work in Notion | "connect this work to Notion" (new work), "adopt this project" (a project with a plan or issues already), from the folder of the work |
| Work on it | "let's work on the next task", "publish the plan", "keep this one local", "end the workflow" |
| See what's overdue, stalled, missing a next step or misplaced, and decide what to do | "review my projects", "what's stalled in Clients?", then "yes 1, 2b", "propose 5", "skip 4 because …", "done" (or `claude --agent ultimate-assistant`) |
| Get what's on your mind into tasks, projects and captures | tell Ultimate Assistant in a few sentences, then "yes to all" |
| Find contradictions, out-of-date facts, duplicate notes and recurring themes, and decide what to do | "tidy the brain", "any duplicates?", then "yes 2", "1a", "later 4", "skip 5 because …", "done" |
| Get one short review of your week: what changed, your tasks, at most five decisions | "weekly review"; "weekly review more" for the rest; "weekly review corrections"; "review my week every Monday", "stop the weekly review" |
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
| Your edit to a Summary or Role changed back | You turned the correction down, or it was never synced | "sync with Notion", then accept it when your agent asks |
| Your edit to a Summary or Role isn't in the brain yet | Corrections wait for your yes | "what needs my decision" |
| A new project or person isn't in the brain | It is imported on the next sync | "sync with Notion" |
| A turned-down change came back | A later source said it again | Turn it down again, or give the true value |
| A record shows Draft | You haven't reviewed it yet | Read it; set **Reviewed**, or **Disputed** if it's wrong |
| A new decision or question isn't in its Brief | It waits for your yes | "what needs my decision" |
| An Area page doesn't list a decision | A decision's Area comes from its project | Link the decision's project to the area, then "sync with Notion" |
| A question's task is Done but the question is still open | The agent asks first whether it is answered | "what needs my decision" |
| A capture wasn't taken in | It is still **New**: the brain takes in only Ready rows | Set it to **Ready**, then "catch up" |
| You fixed the minutes after the ingest, and nothing changed | The meeting is still Ingested | Set it back to **Reviewed**, then "catch up" |
| You want to see what the brain made from a document | Every input has a row in Knowledge → Inbox → What came in?, and on its project's page | Open the row: the body has the digest, and Documents and People list what it produced; its decisions and questions show in the project's Brief |
| A Brief says nothing is accepted yet | Its notes are still Draft | "what needs my decision" |
| A document's row shows only the digest | Inbox rows get a digest; the whole text lives in a Document | Click **Keep as document** on the row, then "catch up" |
| A changed version (Kind Changed) is still New | It waits for your check | Check its text, then say "go", or set it **Ready** for the next catch-up |
| A document's row was set Ready again but not taken in | Its changed version is waiting for your check | Say "go" on the changed version, or "take in the whole original instead" |
| A capture is Done but produced nothing | It repeats a source the brain already has; its Summary says "Skipped: same as …" | Nothing, or say "ingest it anyway" if it adds something |
| A button's box stays ticked | No catch-up has run since, or the module is off | "catch up"; if the report says the module is off, "turn on documents" (or reports) |
| Goals, Tasks or Documents aren't updated any more | Their module is off | "which modules do I have?", then "turn on …" |
| A file attached to a capture wasn't read | Its format can't be read, or the file is broken | The catch-up's Check line names the file and the fix |
