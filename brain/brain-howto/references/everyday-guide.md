# Ultimate Brain: Everyday Guide

Capture information, remember decisions and keep track of your work. Use ordinary language: there are no commands to memorise.

## Where to do what

| Place | Use it for |
|---|---|
| **Notion** | Capture ideas, read your knowledge, manage tasks and review proposed changes. |
| **Brain Assistant in Notion AI** | Prepare for meetings, explain proposals, clean captures and help write documents. |
| **Your agent in Claude Code or Codex** | Bring information into the brain, apply your decisions, answer questions and maintain the system. |

Open your agent in your brain's folder for the requests below. Connected work folders also support the actions configured for them. Features depend on your installed version and enabled modules; ask **“Which modules do I have?”** if something is missing.

## Your everyday routine

1. **Capture:** add an idea, document or meeting in Notion.
2. **Check:** correct meeting minutes and mark them **Reviewed**. Mark captures **Ready** when you want them processed.
3. **Process:** tell your agent **“Catch up.”**
4. **Review:** open **Review → Needs my decision** and decide which proposals to accept.
5. **Apply:** submit your decisions, then tell your agent **“Apply my reviews”** or **“Catch up”** again.
6. **Ask:** use your brain when you need context: **“What did we decide about …?”**

Ready and Reviewed make inputs available for processing. Processing happens when an agent runs, on request or through a configured schedule. Marking a meeting Reviewed confirms its minutes; reviewing the resulting knowledge is a separate step.

## What to say to your agent

| I want to… | Say… |
|---|---|
| Process everything waiting | **“Catch up.”** It asks its questions together before processing. |
| Ask about existing knowledge | **“What did we decide about …, and why?”** Answers include sources. |
| Process reviewed meetings | **“Ingest my reviewed meetings.”** |
| Process captures or dropped files | **“Process my inbox.”** / **“Process my drop folder.”** |
| Add a file, web page or email | **“Ingest this PDF: <path>”** / **“Ingest this page: <url>”** / **“Ingest this email”**, then paste it. |
| Apply decisions made in Review | **“Apply my reviews.”** |
| Bring Notion edits into the brain and publish changes | **“Sync with Notion.”** |
| Get or update a report | **“Report on …”** / **“Refresh the … report.”** |
| Keep a readable document | **“Keep this as a document.”** / **“Only keep the budget section as a document.”** |
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
| **Ask the brain** | Home | Creates a report request. Type your question as its name, then say **“Catch up.”** Requires Reports and Documents. |
| **Tidy capture** | A **New** Inbox capture | Notion AI immediately cleans the wording. Check the result, set **Ready**, then say **“Catch up.”** |
| **Keep as document** | An Inbox item | Requests a readable Document and sets the item to **Ready**. Fill in **Only keep** for a specific section, then say **“Catch up.”** |
| **Promote to document** | A Decision | Requests an editable Document based on the decision. Say **“Catch up”** to create it. |
| **Write up** | A promoted Document | Notion AI develops the page using linked brain pages. Review and edit it, then click **Accept**. On later runs, copy the wording you want from **Proposed revision** into the document body, delete that toggle, then click **Accept**. |
| **Refresh report** | A report in Documents | Notion AI adds a proposed refresh in a toggle. Review it, replace the report text if you agree, delete the toggle, then click **Accept**. |
| **Accept** | A Document or report | Marks the current wording for the next **“Catch up.”** Your click authorises that exact wording; if the page changes afterward, accept the final version again. |
| **Submit decisions** | A Review page with item sections | Submits your individual decisions. Say **“Apply my reviews”** afterward. |
| **Submit and accept all** | A Review page with item sections | Submits your decisions **and accepts every item still Pending**. Check those remaining items before clicking. Then say **“Apply my reviews.”** |

The Notion AI buttons need Brain Assistant configured. Document and report buttons also depend on their modules being enabled. **Only keep** limits the document you preserve; it does not exclude the rest of an input from knowledge processing. Use the selection controls below for exclusions.

## Notion AI prompts

Find the assistant under **Agents → Brain Assistant**. The reusable prompt texts live as pages in the **Skills** database (Brain Assistant's skills; in a space built before 0.14.0 it may be called **Brain Assistant Skills**). If your setup uses personal Notion AI skills instead, run the same named skills there.

**Run a skill by asking for it by name** in Brain Assistant's chat: "Run Today", "Run Prep". Brain Assistant doesn't run a skill typed as a `/` command, so `/Today` does nothing there. To point at a skill's page instead, paste its link (open it from your space's Skills database, ••• → Copy link); don't pick it from the `@` picker, which can offer another space's page of the same name. If Today shows another space's tasks, ask by name again, and check that the agent's Tools and access hold only the Brain Data, How it works and Skills under your space's top page.

For a prompt about one page, open or reference that page so the assistant knows which one you mean.

| Prompt | Where to use it | How to run it and what it does |
|---|---|---|
| **Today** | Brain Assistant chat | **"Run Today"** shows due tasks, today's meetings and pending decisions. |
| **Review queue** | Brain Assistant chat | **"Run Review queue"** explains pending proposals and their sources. You make the decisions. |
| **Prep** | With a meeting page referenced | **"Run Prep"** gathers relevant meetings, questions, tasks and decisions before the meeting. |
| **Check minutes** | A meeting page before it is Reviewed | **"Run Check minutes"** flags missing information and details to confirm. It fixes the text after your confirmation. |
| **Weekly review** | Brain Assistant chat | **"Run Weekly review"** summarises the past week, project and goal health, and the coming week. |
| **Plan check** | Brain Assistant chat | **"Run Plan check"** finds gaps across Areas, goals and projects. It suggests fixes for you to consider. |
| **Tidy capture** | A **New** Inbox capture | **"Run Tidy capture"** proposes clearer wording and waits for confirmation. The **Tidy capture** button authorises the rewrite immediately. |
| **Voice summary** | A **New** Inbox capture with a **Transcript** toggle | Say **“Summarize this voice note.”** Confirm the summary, check what should enter the brain, then set **Ready**. |
| **Clean email** | An Inbox capture containing a pasted email thread, best while still **New** | **"Run Clean email"** cleans the page directly, preserving message wording and removing clutter. It asks when something is unclear. Check it, then set **Ready**. |
| **Write up** | A promoted Document | Click the **Write up** button. Review and edit the result before clicking **Accept**. |
| **Refresh report** | A report in Documents | Click **Refresh report**. Review its proposed text before replacing the current report and clicking **Accept**. |

**Meeting-summary prompt:** this is separate from the eleven skills. Keep the transcript on the meeting page: a recorded meeting's is in the meeting-notes block's Transcript, and one you paste goes in the page body. Open the Notion AI chat on that page, paste the minutes prompt followed by the line **“Write the minutes on this page, below the transcript, and nothing else.”**, and send. Don't run it from Notion AI's settings: there it can replace the transcript. If the transcript is gone, put it back above the minutes (Notion's version history, or paste it again): without it the brain can't read the meeting. Then run **Check minutes**, correct the result and mark the meeting **Reviewed**. If you cannot find the prompt, ask your agent **“Give me the minutes prompt.”** It is supplied with Ultimate Brain as `notion/minutes-format.md`; do not assume it is inside the meeting template.

The Notion AI **Weekly review** is an on-demand summary of Notion pages. Scheduling catch-up is a separate operation. Clicking **Refresh report** uses Notion pages; asking your agent to refresh a report uses the brain's canonical notes.

## Review meetings and proposals

**For meetings:** the minutes start with **In one line**, your **Quick follow-ups** and the **Tasks for the brain**, then a few lines per subject; a collapsed **For the brain** toggle at the end holds the selection lines and the quotes behind each line. Check names, dates, figures, attendees, project and commitments before marking **Reviewed**. Tick the follow-ups you've done before **Reviewed**: each one still unticked becomes a Task with no due date; tick or delete one to keep it out. To leave a subject out of the brain, open **For the brain** and change its selection line to **`Selection: Meeting only`**. To leave out one item, write **`Meeting only:`** at the start of its quote line there, never on the summary line, where it blocks the meeting. Minutes written with an earlier prompt are read as before (**`Meeting only:`** goes at the start of the item), and their follow-ups never become Tasks. Check the actual Task's status in Notion after processing.

**Each Review row's Status says where to decide it:** **Needs you · decide in the page** or **Needs you · set Your call**. **Submitted: waiting for the brain** means your part is done.

**For Review pages with item sections** (decide in the page): read the proposed wording and edit it if needed. On each item's **`Decision:`** text line, replace **Pending** with **Accept**, **Reject**, **Defer** or **Request revision**. For **Request revision**, write what you want changed on **`Revision request:`**. Click **Submit decisions**, then say **“Apply my reviews.”**

**For Conflict, Answer and Suggestion rows, and older Review rows** (set Your call): use **Your call → Approve, Reject or Fix**. Explain a Fix in **What to fix**, then say **“Apply my reviews.”**

## Occasional operations

| I want to… | Say to your agent… |
|---|---|
| Schedule processing | **“Run catch-up every morning.”** |
| Check or stop the schedule | **“What is scheduled?”** / **“Stop the scheduled catch-up.”** |
| Check optional capabilities | **“Which modules do I have?”** |
| Enable a capability | **“Turn on documents.”** / **“Turn on reports.”** |
| Connect a work folder to Notion | From that folder: **“Connect this work to Notion.”** |
| Bring an existing plan into connected work | **“Adopt this project.”** |
| Work on a connected project | **“Let's work on the next task.”** / **“Publish the plan.”** / **“Keep this one local.”** |
| Let the brain learn from a repository | **“Link the repo at …”** / **“Check my linked repos.”** |
| Check or change the Notion structure | **“Check my Notion space.”** / **“Add a property to Projects …”** The agent follows the product's design process. |
| Get help updating | **“Help me update Ultimate Brain and upgrade my brain.”** |

Scheduled catch-up needs the configured computer and agent available. It may leave questions or corrections for your next attended session.

## When something seems stuck

| What happened | Try this |
|---|---|
| A capture was ignored | Check that it is **Ready**, then say **“Catch up.”** |
| A meeting was ignored | Check that it is **Reviewed**, then say **“Catch up.”** |
| You corrected an already processed meeting | Set it back to **Reviewed**, then say **“Catch up.”** |
| You decided a proposal but nothing changed | Submit the decisions where required, then say **“Apply my reviews.”** |
| A button request is still waiting | Say **“Catch up”**; check whether its module is enabled. |

Put your own project notes in **My notes**. The brain refreshes generated sections such as **Brief** and **Decision log**.

For more detail, open **How it works** in Notion, read the [full guide](guide.md), or ask **“How do I …?”**

## Skill names, if you need them

You can use the phrases above without naming a skill. For reference: **brain-catch-up** processes waiting work; **brain-ingest** takes in inputs; **brain-apply** applies your decisions; **brain-sync** synchronises with Notion; **brain-query** answers questions, writes reports and handles memory; **ultimate-assistant** reviews work; **brain-reflect** tidies knowledge; **brain-howto** explains the system; **brain-connect-notion** connects Notion and manages modules; **brain-repos** connects repositories; **brain-workflow** tracks work; **brain-workflow-adopt** imports existing plans; **brain-notion-change** checks or changes the Notion structure.
