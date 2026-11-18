# Ultimate Brain: Everyday Guide

Capture information, remember decisions and keep track of your work. Use ordinary language: there are no commands to memorise.

## Where to do what

| Place | Use it for |
|---|---|
| **Notion** | Capture ideas, read your knowledge and manage tasks. |
| **Brain Assistant in Notion AI** | Prepare for meetings, check minutes, clean captures and help write documents. Needs Business (or Enterprise) with Notion credits. Duplicating the template doesn't give you one: create your own as **First things first** (linked from Start here) says, and **“set up my brain”** checks it. |
| **Your agent in Claude Code or Codex** | Bring information into the brain, ask you what it needs decided, answer questions and maintain the system. Every decision is made here. |

Open your agent in your brain's folder for the requests below. Connected work folders also support the actions configured for them. Features depend on your installed version and enabled modules; ask **“Which modules do I have?”** if something is missing.

## Your everyday routine

1. **Capture:** add an idea, document or meeting in Notion.
2. **Check:** correct meeting minutes and set them **Ready**, as you set captures **Ready** when you want them processed. Meetings have one extra state, **Skipped**, for a meeting you keep but don't want in the brain.
3. **Process:** tell your agent **“Catch up.”** For each input it shows what came in, one subject at a time: what the brain already has, what is added, its questions, then **“accept?”**. Answer in the chat. Nothing goes in until you answer.
4. **Decide:** at the end it asks what is still waiting, at most five questions at a time, most important first. Say **“more”** for the next ones, or **“enough”** to stop.
5. **Ask:** use your brain when you need context: **“What did we decide about …?”**

Ready makes an input available for processing. Processing happens when an agent runs, on request or through a configured schedule. Setting a meeting Ready confirms its minutes; accepting what it adds to the brain happens in the chat. A scheduled run takes inputs in without you and leaves its questions for your next session.

## What to say to your agent

| I want to… | Say… |
|---|---|
| Process everything waiting | **“Catch up.”** It asks what blocks first, then each input's subjects, then what is waiting. |
| Ask about existing knowledge | **“What did we decide about …, and why?”** Answers include sources. |
| Process reviewed meetings | **“Ingest my reviewed meetings.”** |
| Process captures or dropped files | **“Process my inbox.”** / **“Process my drop folder.”** |
| Add a file, web page or email | **“Ingest this PDF: <path>”** / **“Ingest this page: <url>”** / **“Ingest this email”**, then paste it. |
| Decide what the brain is waiting for | **“What needs my decision?”** Your edits in Notion to the brain's values come first, as one question. |
| Follow up an open question | **“Track the … question.”** It becomes a task with Kind Question, on the Tasks page. |
| Bring Notion edits into the brain and publish changes | **“Sync with Notion.”** Your edits to the brain's values are asked before they go in. |
| Get or update a report | **“Report on …”** / **“Refresh the … report.”** |
| Keep a readable document | **“Keep this as a document.”** / **“Only keep the budget section as a document.”** / **“Promote the decision on … to a document.”** A part comes back to your Inbox to check first. |
| Change a document before it goes in | **“Take in this PDF, but keep only the pilot section.”** It writes the changed version to your Inbox, Brain Status New. Check or edit it there, then say **“Go”**, or set it **Ready**. |
| Keep a task's page as a document | **“Keep the … task as a document.”** It then asks what to add **From the brain**. |
| Find overdue or stalled work | **“Review my projects.”** / **“What's stalled in …?”** |
| Find conflicting or outdated knowledge | **“Tidy the brain.”** |
| Save a lasting lesson or preference | **“Remember this: …”** Review the proposed memory before saving. |
| Finish a work session | **“Wrap up.”** Records where work stopped and offers lessons for your approval. |
| Get help | **“How do I …?”** / **“Why didn't …?”** |

**Catch up** handles several actions together. Use the narrower requests when you want only one thing done. Reviewing projects and tidying knowledge show findings first; you decide which changes to make.

## Buttons in Notion

| Button | Where | What happens and what to do next |
|---|---|---|
| **Quick capture** | Home | Creates an Inbox capture as **Ready**. Add your content, then say **“Catch up.”** Set it to **New** while preparing it if needed. |
| **New meeting** | Home | Creates a meeting page. Add the details and use it for notes. |
| **New project** | Home | Creates a project as **Planned**. Fill in its details, then say **“Sync with Notion”** to bring it into the brain. |
| **New task** | Home | Creates a task (Kind **Task**, the default status, **To Do**) with no project or due date, and opens it. Give it a project, area or due date if you want; it's yours, like a task added in Tasks. Requires Tasks. |
| **Ask the brain** | Home | Creates a report request. Type your question as its name, then say **“Catch up.”** Requires Reports and Documents. |
| **Tidy capture** | A **New** Inbox capture | Notion AI immediately cleans the wording. Check the result, set **Ready**, then say **“Catch up.”** |
| **Keep as document** | An Inbox item | Requests a readable Document and sets the item to **Ready**. Fill in **Only keep** for a specific section, then say **“Catch up.”** With Only keep, that section first comes back as a changed version for you to check. |
| **Keep as document** | A task | Keeps the task's page as a Document at the next **“Catch up,”** then asks what to add **From the brain**. Requires Documents. |
| **Write up** | A promoted Document | Notion AI develops the page using linked brain pages. Review and edit it, then click **Accept**. On later runs, copy the wording you want from **Proposed revision** into the document body, delete that toggle, then click **Accept**. |
| **Refresh report** | A report in Documents | Notion AI adds a proposed refresh in a toggle. Review it, replace the report text if you agree, delete the toggle, then click **Accept**. |
| **Accept** | A Document or report | Marks the current wording for the next **“Catch up.”** Your click authorises that exact wording; if the page changes afterward, accept the final version again. |

The Notion AI buttons message Brain Assistant, so each needs your own Brain Assistant selected in its **Send message to** (First things first), and Business (or Enterprise) with Notion credits. Document and report buttons also depend on their modules being enabled. **Only keep** limits the document you preserve; it does not exclude the rest of an input from knowledge processing. Use the selection controls below for exclusions.

## Notion AI prompts

Find the assistant under **Agents → Brain Assistant**. The reusable prompt texts live as pages in the **Skills** database (Brain Assistant's skills; in a space built before 0.14.0 it may be called **Brain Assistant Skills**). If your setup uses personal Notion AI skills instead, run the same named skills there.

**Run a skill by asking for it by name** in Brain Assistant's chat: "Run Today", "Run Prep". Brain Assistant doesn't run a skill typed as a `/` command, so `/Today` does nothing there. To point at a skill's page instead, paste its link (open it from your space's Skills database, ••• → Copy link); don't pick it from the `@` picker, which can offer another space's page of the same name. If Today shows another space's tasks, ask by name again, and check that the agent's Tools and access hold only the Brain Data, How it works and Skills under your space's top page.

For a prompt about one page, open or reference that page so the assistant knows which one you mean.

| Prompt | Where to use it | How to run it and what it does |
|---|---|---|
| **Today** | Brain Assistant chat | **"Run Today"** shows due tasks and today's meetings. |
| **Prep** | With a meeting page referenced | **"Run Prep"** gathers relevant meetings, questions, tasks and decisions before the meeting. |
| **Check minutes** | A meeting page before it is Ready | **"Run Check minutes"** flags missing information and details to confirm. It fixes the text after your confirmation. |
| **Weekly review** | Brain Assistant chat | **"Run Weekly review"** opens this week's review (the Inbox row **Week of …**), summarises it and explains its items. It decides nothing: you change the tasks in Notion and decide the rest with your agent (**“What needs my decision?”**). With no review this week, it says how to get one. |
| **Plan check** | Brain Assistant chat | **"Run Plan check"** finds gaps across Areas, goals and projects. It suggests fixes for you to consider. |
| **Tidy capture** | A **New** Inbox capture | **"Run Tidy capture"** proposes clearer wording and waits for confirmation. The **Tidy capture** button authorises the rewrite immediately. |
| **Voice summary** | A **New** Inbox capture with a **Transcript** toggle | Say **“Summarize this voice note.”** Confirm the summary, check what should enter the brain, then set **Ready**. |
| **Clean email** | A **New** Inbox capture containing a pasted email thread | **"Run Clean email"** cleans the page directly, preserving message wording and removing clutter. It asks when something is unclear. On a **Ready** capture it stops, since the brain may already be taking it in: set it to **New** first. Check the result, then set **Ready**. |
| **Write up** | A promoted Document | Click the **Write up** button. Review and edit the result before clicking **Accept**. |
| **Refresh report** | A report in Documents | Click **Refresh report**. Review its proposed text before replacing the current report and clicking **Accept**. |

**Meeting-summary prompt:** it is kept as **Write minutes**, the eleventh page of Brain Assistant's Skills database, so you can copy it from there; Brain Assistant doesn't run it, and asked to write minutes, it points you to these steps. Keep the transcript on the meeting page: a recorded meeting's is in the meeting-notes block's Transcript, and one you paste goes in the page body. Open the Notion AI chat on that page, paste the minutes prompt followed by the line **“Write the minutes on this page, below the transcript, and nothing else.”**, and send. Don't run it from Notion AI's settings: there it can replace the transcript. If the transcript is gone, put it back above the minutes (Notion's version history, or paste it again): without it the brain can't read the meeting. Then run **Check minutes**, correct the result and set the meeting **Ready**. Don't let Notion AI or a notetaker create Tasks from the meeting: the brain creates them, once, when it takes the meeting in. A notetaker (Granola, Fireflies) that writes to Notion: turn off its own export of tasks to the brain's Tasks database. If you cannot find the prompt, open **Write minutes** in your space's Skills database, or ask your agent **“Give me the minutes prompt.”** It is supplied with Ultimate Brain as `notion/minutes-format.md`; do not assume it is inside the meeting template.

The weekly review itself is written by your agent ("weekly review", or every Monday on a schedule) and appears as an Inbox row; Brain Assistant's **Weekly review** reads it with you in Notion. Scheduling catch-up is a separate operation. Clicking **Refresh report** uses Notion pages; asking your agent to refresh a report uses the brain's canonical notes.

## Check meetings, then decide in the chat

**For meetings:** the minutes start with **In one line**, your **Quick follow-ups** and the **Tasks for the brain**, each a heading with a divider under it, then a few bullets per subject, each starting with a bold **Decided:**, **Open:**, **Concern:**, **Waiting on <name>:** or **Idea:**; a collapsed **For the brain** toggle at the end holds the selection lines and the quotes behind each line. Check names, dates, figures, attendees, project and commitments before setting **Ready**. Tick the follow-ups you've done before **Ready**: each one still unticked becomes a Task with no due date; tick or delete one to keep it out. To leave a subject out of the brain, open **For the brain** and change its selection line to **`Selection: Meeting only`**. To leave out one item, write **`Meeting only:`** at the start of its quote line there, never on the summary line, where it blocks the meeting. Minutes written with an earlier prompt are read as before (**`Meeting only:`** goes at the start of the item), and their follow-ups never become Tasks. Check the actual Task's status in Notion after processing. To follow up a question or risk from the meeting as a task, write **`Track: Waiting On —`** at the start of its line.

**Deciding** happens in your agent's chat, never in Notion. When you **Catch up**, each input is shown one subject at a time: a short view of what the brain has, what is added (`+` lines), the questions (each with options and a recommendation), then **“accept?”**. Answer **yes**, **“all except …”**, **no**, **later**, **“enough”** (the rest waits) or **“stop”** (nothing written; the input stays as it is). What you leave for later, and what a scheduled run brought in, waits for **“What needs my decision?”**: at most five questions a round, your edits in Notion to the brain's values first, as one question.

**Your edits in Notion** to a value the brain owns (a Summary, a Role, a Key Fact) are asked before they go in, because the brain can't tell your edit from one made by Notion AI or another tool. Until you answer, the brain leaves your edit as it is in Notion.

**A question you follow up as a task:** when its task is **Done**, **Won't Do** or deleted, the brain asks whether the question is answered: say the answer, drop the question, or keep it open.

**A document you want changed before it goes in** (only one section, a figure corrected): ask your agent, and it writes the changed version to your Inbox (Kind Changed, Brain Status New), listing what it left out or altered. Nothing goes in yet. Check or edit it, then say **“Go”** or set it **Ready**. What goes in cites your version; the original stays linked. Meetings and captures keep their own checks.

## Occasional operations

| I want to… | Say to your agent… |
|---|---|
| Schedule processing | **“Run catch-up every morning.”** |
| Check or stop the schedule | **“What is scheduled?”** / **“Stop the scheduled catch-up.”** |
| Review your week | **“Weekly review.”** / **“Review my week every Monday.”** |
| Check optional capabilities | **“Which modules do I have?”** |
| Enable a capability | **“Turn on documents.”** / **“Turn on reports.”** |
| Connect a work folder to Notion | From that folder: **“Connect this work to Notion.”** |
| Bring an existing plan into connected work | **“Adopt this project.”** |
| Work on a connected project | **“Let's work on the next task.”** / **“Publish the plan.”** / **“Keep this one local.”** |
| Let the brain learn from a repository | **“Link the repo at …”** / **“Check my linked repos.”** |
| Check or change the Notion structure | **“Check my Notion space.”** / **“Add a property to Projects …”** The agent follows the product's design process. |
| Get help updating | **“Help me update Ultimate Brain and upgrade my brain.”** |

Scheduled catch-up needs the configured computer and agent available. It decides nothing: it leaves its questions, and your edits from Notion, for your next attended session.

## When something seems stuck

| What happened | Try this |
|---|---|
| A capture was ignored | Check that it is **Ready**, then say **“Catch up.”** |
| A meeting was ignored | Check that it is **Ready**, then say **“Catch up.”** |
| You corrected an already processed meeting | Set it back to **Ready**, then say **“Catch up.”** |
| Something waits for your decision | Say **“What needs my decision?”** |
| A button request is still waiting | Say **“Catch up”**; check whether its module is enabled. |
| Tidy capture, Write up or Refresh report does nothing | In the button's settings, select your own Brain Assistant in **Send message to** (First things first), then say **“Check Brain Assistant again.”** |
| A changed version sits as **New** | It waits for your check: say **“Go,”** or set it **Ready**. |

Put your own project notes in **My notes**. The brain refreshes generated sections such as **Brief** and **Decision log**.

For more detail, open **How it works** in Notion, read the [full guide](guide.md), or ask **“How do I …?”**

## Skill names, if you need them

You can use the phrases above without naming a skill. For reference: **brain-catch-up** processes waiting work; **brain-ingest** takes in inputs; **brain-apply** asks what needs your decision and applies your answers; **brain-sync** synchronises with Notion; **brain-query** answers questions, writes reports and handles memory; **ultimate-assistant** reviews work; **brain-reflect** tidies knowledge; **brain-howto** explains the system; **brain-connect-notion** connects Notion and manages modules; **brain-repos** connects repositories; **brain-workflow** tracks work; **brain-workflow-adopt** imports existing plans; **brain-notion-change** checks or changes the Notion structure.
