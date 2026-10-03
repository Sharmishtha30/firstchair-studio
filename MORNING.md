# Morning handoff — Call to Reel v1

## What works

- A landing page with one explanation and one button into the workspace.
- One pasted customer transcript and a short brand note produce three Instagram reel scripts, each with spoken lines, on-screen text, a caption, and visible supporting customer quotes.
- Feedback revises one selected script. The other two stay unchanged. The revised version is saved in Convex.
- Copy buttons, waiting states, input limits, and readable failure messages are included.
- No AI key is configured on the local backend. The visible **Sample mode** banner explains that output is simple quote arrangement, not AI writing, and that brand voice is not applied. “Make it shorter” picks a shorter quote; “add more detail” adds a quote; other feedback reorders quotes.
- The AI path is wired to the Convex agent component and OpenAI `gpt-4.1-mini`. It uses the brand note and feedback to select and order customer statements. Every output line must match a complete customer statement; unsupported wording is rejected before saving. This conservative v1 uses quote selection and pacing for voice, rather than paraphrasing or adding brand claims.
- Convex handles the backend and database. Convex static hosting is configured for later, but no website or backend code was sent to a cloud deployment.
- No login, video generation, CRM, Instagram connection, or other channels were added.

## How to open it on your laptop

Open Terminal and run:

```sh
cd /Users/sam/build-sprint-app
npm run dev
```

Keep that terminal open. Open **http://localhost:5173/** in your browser. If the command reports another port, use that address. Click **Create my scripts**, then **Use sample transcript**, then **Generate three scripts**. Type **Make it shorter** under one script and click **Revise this script**.

The current development setup uses a local Convex backend at `http://127.0.0.1:3210`. It runs on your laptop and stores its data locally. Your original cloud settings were preserved in the ignored files `.env.original.local` and `.env.cloud.backup`; `.env.local` now points to the local backend so normal development does not publish anything. Do not switch back to cloud settings just to try the demo.

Refreshing clears the scripts shown in this browser session. The records remain in local Convex; a history/reopen screen is outside this v1.

## Exactly which key to add

Add an **OpenAI API key** as the server-side Convex environment variable **`OPENAI_API_KEY`**. A ChatGPT subscription does not supply this key. Create an API key in your OpenAI platform account, then with the local backend running use:

```sh
npx convex env set OPENAI_API_KEY
```

The command asks for the value. Paste your key there. Refresh the page and generate again: the banner should disappear and the result should say **AI output**. Do not put the key in frontend code or any `VITE_` variable. Existing sample runs remain sample runs; generate a new run to test AI writing.

## What I could not finish, and why

- **Real AI output and brand voice have not been tested.** No OpenAI API key was available on the local backend. The integration compiles, but a successful live model response and arbitrary AI feedback need checking after the key is added. Errors do not silently fall back to sample output.
- **Browser click-through and visual review could not be completed.** The browser connector reported “No browser is available,” and native Safari controls failed with “Sky Computer Use native pipe startup failed.” I verified the page is served, the frontend builds, and the real local Convex generation/revision/database path passes. I cannot claim I saw the rendered page working in a browser.
- **Deployment was deliberately not run**, as requested. Hosting configuration is present, but live hosting has not been tested. Local `npm run dev` and `npm run build` do not publish. `npm run deploy` is the future publishing command; do not run it yet.
- Labelled transcripts must identify customer lines with `Customer:`, `Client:`, `Buyer:`, `User:`, or `Participant:`. Other speaker lines are excluded. Unlabelled text is treated as customer statements. At least three customer statements are required.

## Checks run

- `npm run check`: passed frontend and Convex type checks.
- `npm run build`: passed and created `dist/`.
- Local Convex confirmed the agent and static hosting components and accepted the backend functions.
- `npm test`: three checks passed, covering customer-only wording, one-script revision, and rejection of removed negations.
- `npm run test:flow`: passed using actual local Convex actions and database reads, with the sample transcript below. It verifies persistence, unchanged scripts 2 and 3, and rejection of unknown sessions and calls without customer speech.
- HTTP request to `http://localhost:5173/`: returned the app entry page.

## Full sample-flow test output

```text

> build-sprint-app@1.0.0 test:flow
> tsx tests/sample-flow.ts

Sample transcript:
Founder: What was frustrating before you tried us?
Customer: I used to spend every Friday chasing updates across five different spreadsheets.
Customer: By the time I found the right numbers, the meeting was already over.
Founder: What changed?
Customer: Now I open one page and know exactly what needs my attention.
Customer: I got my Friday afternoons back.
Customer: My team spends less time reporting and more time helping customers.
Founder: Anything else?
Customer: I wish we had made the switch sooner.

Brand note:
Calm, direct, practical. Short sentences. No hype.

Generated output (sample mode):
{
  "mode": "sample",
  "reels": [
    {
      "caption": "I got my Friday afternoons back.",
      "onScreen": [
        "I used to spend every Friday chasing updates across five different spreadsheets."
      ],
      "script": [
        "I used to spend every Friday chasing updates across five different spreadsheets.",
        "I got my Friday afternoons back."
      ],
      "sources": [
        "I used to spend every Friday chasing updates across five different spreadsheets.",
        "I got my Friday afternoons back."
      ],
      "title": "The everyday friction"
    },
    {
      "caption": "My team spends less time reporting and more time helping customers.",
      "onScreen": [
        "By the time I found the right numbers, the meeting was already over."
      ],
      "script": [
        "By the time I found the right numbers, the meeting was already over.",
        "My team spends less time reporting and more time helping customers."
      ],
      "sources": [
        "By the time I found the right numbers, the meeting was already over.",
        "My team spends less time reporting and more time helping customers."
      ],
      "title": "The turning point"
    },
    {
      "caption": "I wish we had made the switch sooner.",
      "onScreen": [
        "Now I open one page and know exactly what needs my attention."
      ],
      "script": [
        "Now I open one page and know exactly what needs my attention.",
        "I wish we had made the switch sooner."
      ],
      "sources": [
        "Now I open one page and know exactly what needs my attention.",
        "I wish we had made the switch sooner."
      ],
      "title": "The customer’s takeaway"
    }
  ]
}

Feedback on script 1: Make it shorter
Revised output:
{
  "caption": "I got my Friday afternoons back.",
  "onScreen": [
    "I got my Friday afternoons back."
  ],
  "script": [
    "I got my Friday afternoons back."
  ],
  "sources": [
    "I got my Friday afternoons back."
  ],
  "title": "The everyday friction"
}

PASS: Three scripts generated through local Convex.
PASS: Script 1 revised and saved; scripts 2 and 3 are unchanged in the database.
PASS: An unknown session cannot revise another run.
PASS: A transcript without customer statements is rejected.
PASS: Every script line, on-screen line and caption is backed by customer words.
```

## Full wording-check output

```text

> build-sprint-app@1.0.0 test
> tsx --test tests/*.test.ts

✔ scripts use customer words and reject invented claims (1.326084ms)
✔ feedback revises one script while retaining customer sources (0.798375ms)
✔ a writer cannot remove a customer’s negation (0.137041ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 196.970167
```

Next: open the local page and try the sample transcript; then add OPENAI_API_KEY to check real brand-voice writing.
