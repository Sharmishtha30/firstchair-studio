# Morning handoff — Call to Reel v1

## Latest fix: greetings were being recommended

The active local backend still reported sample mode: no usable OPENAI_API_KEY was found in its environment, the preserved settings files, or the original Convex deployment. The previous custom-transcript sample fallback selected early lines, so greetings became scripts. That fallback is removed. The parser also dropped customer lines without a repeated label; it now retains them until the next speaker.

With a key connected, the writer now first runs a separate insight analysis, selecting substantive pain, emotion and takeaway evidence from the whole customer conversation. Only then does it write and review the content. Greetings cannot be insight evidence. Live model output is still unverified until the active backend has a usable key.

To connect the key to this running local backend, copy your OpenAI API key, then run from the project folder:

```sh
pbpaste | npx convex env set OPENAI_API_KEY
```

Refresh the page. The header should say **AI writer connected**. Generate a new run; old sample runs remain samples.

## What works

- A landing page with one explanation and one button into the workspace.
- One pasted customer transcript and a short brand note produce three Instagram reel scripts, each with spoken lines, on-screen text, a caption, and visible supporting customer quotes.
- Feedback revises one selected script. The other two stay unchanged. The revised version is saved in Convex.
- Copy buttons, waiting states, input limits, and readable failure messages are included.
- No AI key is configured on the local backend. The visible **Sample mode** banner distinguishes hand-written examples for the bundled call from AI analysis; custom transcripts require the key.
- Recommendations now develop three distinct stories: the practical pain, the emotional moment, and a supported change or takeaway. The screen shows the selected pain, emotion, whether that emotion is stated or inferred, and the central content idea.
- The AI path uses the Convex agent component and OpenAI `gpt-4.1-mini`. It writes hooks, short spoken narratives, screen beats and captions using faithful paraphrases in the brand's voice. Each output line carries exact supporting customer statements. A separate model review checks whether the draft's meaning is supported before saving. This review is an extra check, not a guarantee of factual accuracy; real model output still needs testing once a key is available.
- The bundled sample call has hand-written pain, emotion and takeaway examples with actual story structure. Custom transcripts now require an AI key: sample mode refuses to pretend it analyzed them. Sample feedback still only shortens, expands or reorders quotes. The sample banner says this explicitly.
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
- `npm test`: eight checks passed, including greeting exclusion, retention of customer continuation lines, refusal of invented insight evidence, distinct story angles, and factual-review gating. These tests do not prove the model can judge meaning correctly.
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
      "caption": "The customer’s problem was not a lack of numbers. It was finding the right ones before the meeting ended. Their change: one page that shows what needs attention.",
      "grounding": [
        {
          "sources": [
            "I used to spend every Friday chasing updates across five different spreadsheets.",
            "By the time I found the right numbers, the meeting was already over.",
            "Now I open one page and know exactly what needs my attention."
          ],
          "text": "Every Friday, the same chase: updates across five different spreadsheets."
        },
        {
          "sources": [
            "I used to spend every Friday chasing updates across five different spreadsheets.",
            "By the time I found the right numbers, the meeting was already over.",
            "Now I open one page and know exactly what needs my attention."
          ],
          "text": "And by the time the right numbers turn up? The meeting is already over."
        },
        {
          "sources": [
            "I used to spend every Friday chasing updates across five different spreadsheets.",
            "By the time I found the right numbers, the meeting was already over.",
            "Now I open one page and know exactly what needs my attention."
          ],
          "text": "That is the problem with scattered reporting: the update arrives after the moment it was needed."
        },
        {
          "sources": [
            "I used to spend every Friday chasing updates across five different spreadsheets.",
            "By the time I found the right numbers, the meeting was already over.",
            "Now I open one page and know exactly what needs my attention."
          ],
          "text": "This customer now opens one page and knows what needs their attention."
        },
        {
          "sources": [
            "I used to spend every Friday chasing updates across five different spreadsheets.",
            "By the time I found the right numbers, the meeting was already over.",
            "Now I open one page and know exactly what needs my attention."
          ],
          "text": "Less hunting for the update. A clearer view of what needs attention."
        },
        {
          "sources": [
            "I used to spend every Friday chasing updates across five different spreadsheets.",
            "By the time I found the right numbers, the meeting was already over.",
            "Now I open one page and know exactly what needs my attention."
          ],
          "text": "Five spreadsheets. One Friday."
        },
        {
          "sources": [
            "I used to spend every Friday chasing updates across five different spreadsheets.",
            "By the time I found the right numbers, the meeting was already over.",
            "Now I open one page and know exactly what needs my attention."
          ],
          "text": "The numbers arrive too late."
        },
        {
          "sources": [
            "I used to spend every Friday chasing updates across five different spreadsheets.",
            "By the time I found the right numbers, the meeting was already over.",
            "Now I open one page and know exactly what needs my attention."
          ],
          "text": "One page. A clearer view."
        },
        {
          "sources": [
            "I used to spend every Friday chasing updates across five different spreadsheets.",
            "By the time I found the right numbers, the meeting was already over.",
            "Now I open one page and know exactly what needs my attention."
          ],
          "text": "The customer’s problem was not a lack of numbers. It was finding the right ones before the meeting ended. Their change: one page that shows what needs attention."
        }
      ],
      "insight": {
        "angle": "pain",
        "emotion": "The customer does not explicitly name an emotion about the reporting task.",
        "emotionBasis": "not_present",
        "evidence": [
          "I used to spend every Friday chasing updates across five different spreadsheets.",
          "By the time I found the right numbers, the meeting was already over."
        ],
        "painPoint": "Weekly updates scattered across five spreadsheets arrive too late to help the meeting.",
        "story": "Reporting loses its purpose when finding the numbers takes longer than the meeting."
      },
      "onScreen": [
        "Five spreadsheets. One Friday.",
        "The numbers arrive too late.",
        "One page. A clearer view."
      ],
      "script": [
        "Every Friday, the same chase: updates across five different spreadsheets.",
        "And by the time the right numbers turn up? The meeting is already over.",
        "That is the problem with scattered reporting: the update arrives after the moment it was needed.",
        "This customer now opens one page and knows what needs their attention.",
        "Less hunting for the update. A clearer view of what needs attention."
      ],
      "sources": [
        "I used to spend every Friday chasing updates across five different spreadsheets.",
        "By the time I found the right numbers, the meeting was already over.",
        "Now I open one page and know exactly what needs my attention."
      ],
      "title": "When the numbers arrive after the meeting"
    },
    {
      "caption": "“I wish we had made the switch sooner.” A customer’s reflection after moving away from the Friday spreadsheet chase and getting their afternoons back.",
      "grounding": [
        {
          "sources": [
            "I used to spend every Friday chasing updates across five different spreadsheets.",
            "I got my Friday afternoons back.",
            "I wish we had made the switch sooner."
          ],
          "text": "“I wish we had made the switch sooner.”"
        },
        {
          "sources": [
            "I used to spend every Friday chasing updates across five different spreadsheets.",
            "I got my Friday afternoons back.",
            "I wish we had made the switch sooner."
          ],
          "text": "That is how this customer looks back on the change."
        },
        {
          "sources": [
            "I used to spend every Friday chasing updates across five different spreadsheets.",
            "I got my Friday afternoons back.",
            "I wish we had made the switch sooner."
          ],
          "text": "Before it, Fridays meant chasing updates across five spreadsheets."
        },
        {
          "sources": [
            "I used to spend every Friday chasing updates across five different spreadsheets.",
            "I got my Friday afternoons back.",
            "I wish we had made the switch sooner."
          ],
          "text": "After it, their words were: “I got my Friday afternoons back.”"
        },
        {
          "sources": [
            "I used to spend every Friday chasing updates across five different spreadsheets.",
            "I got my Friday afternoons back.",
            "I wish we had made the switch sooner."
          ],
          "text": "The story here is not just about reporting. It is about getting part of their week back."
        },
        {
          "sources": [
            "I used to spend every Friday chasing updates across five different spreadsheets.",
            "I got my Friday afternoons back.",
            "I wish we had made the switch sooner."
          ],
          "text": "“I got my Friday afternoons back.”"
        },
        {
          "sources": [
            "I used to spend every Friday chasing updates across five different spreadsheets.",
            "I got my Friday afternoons back.",
            "I wish we had made the switch sooner."
          ],
          "text": "“I wish we had made the switch sooner.” A customer’s reflection after moving away from the Friday spreadsheet chase and getting their afternoons back."
        }
      ],
      "insight": {
        "angle": "emotion",
        "emotion": "Regret about waiting to switch; relief is a possible reading of getting Friday afternoons back.",
        "emotionBasis": "inferred",
        "evidence": [
          "I used to spend every Friday chasing updates across five different spreadsheets.",
          "I got my Friday afternoons back.",
          "I wish we had made the switch sooner."
        ],
        "painPoint": "Friday afternoons went into chasing scattered updates.",
        "story": "The emotional hook is wishing they had changed sooner, rather than another reporting feature."
      },
      "onScreen": [
        "“I wish we had made the switch sooner.”",
        "“I got my Friday afternoons back.”"
      ],
      "script": [
        "“I wish we had made the switch sooner.”",
        "That is how this customer looks back on the change.",
        "Before it, Fridays meant chasing updates across five spreadsheets.",
        "After it, their words were: “I got my Friday afternoons back.”",
        "The story here is not just about reporting. It is about getting part of their week back."
      ],
      "sources": [
        "I used to spend every Friday chasing updates across five different spreadsheets.",
        "I got my Friday afternoons back.",
        "I wish we had made the switch sooner."
      ],
      "title": "“I wish we had made the switch sooner.”"
    },
    {
      "caption": "“My team spends less time reporting and more time helping customers.” That is this customer’s takeaway: a clearer view of what needs attention, and more time helping people.",
      "grounding": [
        {
          "sources": [
            "Now I open one page and know exactly what needs my attention.",
            "My team spends less time reporting and more time helping customers."
          ],
          "text": "What changes when your team spends less time reporting?"
        },
        {
          "sources": [
            "Now I open one page and know exactly what needs my attention.",
            "My team spends less time reporting and more time helping customers."
          ],
          "text": "For this customer, the answer was more time helping customers."
        },
        {
          "sources": [
            "Now I open one page and know exactly what needs my attention.",
            "My team spends less time reporting and more time helping customers."
          ],
          "text": "They open one page and know what needs their attention."
        },
        {
          "sources": [
            "Now I open one page and know exactly what needs my attention.",
            "My team spends less time reporting and more time helping customers."
          ],
          "text": "The takeaway is not another report. It is what their team gets to spend more time doing."
        },
        {
          "sources": [
            "Now I open one page and know exactly what needs my attention.",
            "My team spends less time reporting and more time helping customers."
          ],
          "text": "Less time reporting."
        },
        {
          "sources": [
            "Now I open one page and know exactly what needs my attention.",
            "My team spends less time reporting and more time helping customers."
          ],
          "text": "More time helping customers."
        },
        {
          "sources": [
            "Now I open one page and know exactly what needs my attention.",
            "My team spends less time reporting and more time helping customers."
          ],
          "text": "“My team spends less time reporting and more time helping customers.” That is this customer’s takeaway: a clearer view of what needs attention, and more time helping people."
        }
      ],
      "insight": {
        "angle": "takeaway",
        "emotion": "No emotion is explicitly stated in this team outcome.",
        "emotionBasis": "not_present",
        "evidence": [
          "Now I open one page and know exactly what needs my attention.",
          "My team spends less time reporting and more time helping customers."
        ],
        "painPoint": "Reporting competed with time spent helping customers.",
        "story": "The useful takeaway is what the team can spend its time on after reporting takes less of it."
      },
      "onScreen": [
        "Less time reporting.",
        "More time helping customers."
      ],
      "script": [
        "What changes when your team spends less time reporting?",
        "For this customer, the answer was more time helping customers.",
        "They open one page and know what needs their attention.",
        "The takeaway is not another report. It is what their team gets to spend more time doing."
      ],
      "sources": [
        "Now I open one page and know exactly what needs my attention.",
        "My team spends less time reporting and more time helping customers."
      ],
      "title": "Less reporting. More helping customers."
    }
  ]
}

Feedback on script 1: Make it shorter
Revised output:
{
  "caption": "Now I open one page and know exactly what needs my attention.",
  "grounding": [
    {
      "sources": [
        "Now I open one page and know exactly what needs my attention."
      ],
      "text": "Now I open one page and know exactly what needs my attention."
    }
  ],
  "insight": {
    "angle": "pain",
    "emotion": "The customer does not explicitly name an emotion about the reporting task.",
    "emotionBasis": "not_present",
    "evidence": [
      "I used to spend every Friday chasing updates across five different spreadsheets.",
      "By the time I found the right numbers, the meeting was already over."
    ],
    "painPoint": "Weekly updates scattered across five spreadsheets arrive too late to help the meeting.",
    "story": "Reporting loses its purpose when finding the numbers takes longer than the meeting."
  },
  "onScreen": [
    "Now I open one page and know exactly what needs my attention."
  ],
  "script": [
    "Now I open one page and know exactly what needs my attention."
  ],
  "sources": [
    "I used to spend every Friday chasing updates across five different spreadsheets.",
    "By the time I found the right numbers, the meeting was already over.",
    "Now I open one page and know exactly what needs my attention."
  ],
  "title": "When the numbers arrive after the meeting"
}

PASS: Three scripts generated through local Convex.
PASS: Script 1 revised and saved; scripts 2 and 3 are unchanged in the database.
PASS: An unknown session cannot revise another run.
PASS: A transcript without customer statements is rejected.
PASS: Every script line, on-screen line and caption has supporting customer quotes.
PASS: Greeting-only calls are rejected rather than converted into content.
PASS: Without an AI key, a custom call does not return pretend insight recommendations.
```

Next: connect OPENAI_API_KEY to the active local backend, confirm the header says AI writer connected, then generate new recommendations.
