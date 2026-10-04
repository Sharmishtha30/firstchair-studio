# Morning handoff — Call to Reel v1

## Writer waiting fix

The writer awaited the AI library's final object promise without consuming its lazy response stream. Analysis, writing and review now drain their streams before accepting the completed object. An actual SDK structured-stream test reproduces and verifies this path with a simulated model; incomplete streams still fail. All three stages share a two-minute cancellation deadline, and the page stops waiting after 130 seconds if a network request never returns. This does not prove a live Pro response; the owner's current call needs a retry. Type checks, the build and 22 checks pass.

## Transcript-reader fix

The reported screenshot shows “ChatGPT plan connected” followed by a transcript-reader rejection. The reader now splits a customer paragraph into individual sentences, strips leading timestamps, and offers a customer-speaker choice for named speakers or “Speaker 1 / Speaker 2”. Only the chosen speaker's words are used, and the choice is saved with the run for revisions. Existing Customer/Founder labels still work. Unit checks cover these formats; a real local Convex action confirms the timestamped paragraph passes the reader. The owner's exact transcript has not been supplied, so its particular format and successful live AI output remain unverified.

## Current status

The app now offers **Continue with ChatGPT** for the local laptop version. This uses the supported ChatGPT plan sign-in flow described in [OpenAI's documentation](https://developers.openai.com/siwc/token-sharing-open-source/sign-in). You approved this addition after the API-credit error. The original no-login requirement is otherwise preserved: there is no separate signup/password flow.

The writer no longer uses OPENAI_API_KEY or falls back to paid API billing. Until ChatGPT is connected, sample mode only accepts the bundled transcript and returns clearly labelled hand-written stories. Your existing API key is still in local Convex settings but is unused by this path. No API key or extra API credit needs to be added for ChatGPT plan sign-in; your ChatGPT plan's allowance and eligibility still apply.

**Not yet proven:** actual OpenAI account approval and real AI generation using your Pro plan. I could not operate a browser: the computer connector returned “Sky Computer Use native pipe startup failed.” I tested our local session round trip using a clearly fake identity and no real provider credentials. That proves local session handling, not successful OpenAI sign-in or content quality.

Nothing was deployed or pushed. Changes were saved in local git checkpoints.

## What works

- Landing page into one text transcript plus one short brand note.
- Three Instagram reel scripts, with spoken script, on-screen text, caption, supporting customer statements, and selected pain, raw emotion, and takeaway.
- Greeting-only calls are rejected. Customer continuation lines are retained. Inferred emotion is labelled. Each drafted claim needs supporting customer words and a separate factual review before saving.
- Feedback revises one selected script, keeping the other two unchanged in Convex.
- ChatGPT sign-in route opens the official approval flow using a callback on this laptop. Sign-in attempts expire, are tied to the browser that started them, and can be consumed only once.
- Provider credentials stay encrypted in the local Convex database. They are not returned to browser storage or committed. The browser receives only a short-lived, single-use sign-in ticket, then a first-party Convex session.
- Connected writing uses a model from the account's current catalog, streaming requests with `store: false`, and rejects interrupted or incomplete responses. Refresh and disconnect paths are implemented.
- The page preserves typed transcript/brand during sign-in, shows the connection state, explains plan usage on first connection, and provides a disconnect button.
- The bundled sample generation, feedback, persistence, and grounding checks pass against the running local backend.
- No video generation, CRM, Instagram connection, or other channels.

## How to open it on your laptop

The local app is running now. Open **http://localhost:5173/#studio**.

If it has stopped:

1. Open Terminal and run `cd /Users/sam/build-sprint-app`.
2. Run `npm run dev` and keep that Terminal open.
3. Open **http://localhost:5173/#studio**. The port is fixed so sign-in returns to the correct page.
4. Click **Continue with ChatGPT**, sign in to the account with Pro, and approve plan usage for Call to Reel.
5. On return, look for **ChatGPT plan connected**, then paste your call and brand note and generate. Give feedback on one script to check the revision.

To try the app without signing in, choose **Use sample transcript**, generate, and revise one script. The sample banner and output label remain visible.

Convex backend: `http://127.0.0.1:3210`. HTTP callbacks: `http://127.0.0.1:3211`. Frontend: `http://localhost:5173`. Local settings and original cloud backups remain ignored by git. The local ChatGPT plan connection deliberately refuses cloud URLs. Do not deploy this personal setup.

## Setup keys

Already configured on this laptop: `JWT_PRIVATE_KEY`, `JWKS` (Convex session keys), `SITE_URL=http://localhost:5173`, `CHATGPT_TOKEN_KEY` (credential encryption), and `CHATGPT_HOST_ID` (stable local app identifier). Secret values are not in git. A fresh checkout needs its own local sign-in settings; never copy provider access or refresh tokens into frontend code or chat.

## What could not be finished, and why

- **Real ChatGPT approval, plan allowance, and live story quality:** require your account sign-in. I cannot claim these passed. The model's factual review also cannot guarantee accuracy; review scripts before posting.
- **Real token renewal and remote revocation:** implemented but unverified without real account credentials. If remote revocation fails, local credentials are still removed and the app asks you to remove Call to Reel in ChatGPT settings.
- **Browser visual review:** unavailable because the browser connector failed. A React loading error was detected in Vite logs; dependency deduplication and a fresh server start were applied, and a provider-render regression check passes. I have not seen the rendered page after that fix.
- **Deployment:** intentionally not performed.
- Sample feedback is still a demonstration that shortens, expands or reorders sample lines. Custom transcript analysis and open-ended feedback require the connected writer.

## Checks run

- `npm run check`: frontend and Convex type checks pass.
- `npm run build`: passes; a harmless package-level “use client” warning is recorded in `verification/build.txt`.
- `npm test`: 22 checks pass. Output: `verification/tests.txt`.
- `npm run test:chatgpt`: local browser-bound ticket, session, callback replay/expiry, disconnect, sign-out and official authorization redirect pass. Uses fake test credentials; no OpenAI inference. Output: `verification/chatgpt-flow.txt`.
- `npm run test:flow`: bundled transcript generation, feedback, persisted unchanged scripts, evidence checks and refusal of greeting/custom-call fake output pass. Full output follows.
- HTTP request to the local frontend returns 200; Convex authentication public keys are served.
- `npm run test:ai`: requires an authenticated local Convex session supplied to the developer test as `CALL_TO_REEL_TEST_SESSION`. Without one it prints **NOT RUN**, rather than pretending live AI passed. The prior API-credit rejection remains in `verification/ai-flow.txt` as historical evidence, not a current ChatGPT-plan test.

## Full sample-transcript test output

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
PASS: Without a ChatGPT connection, a custom call does not return pretend insight recommendations.
PASS: A timestamped customer paragraph passes the real Convex reader after speaker selection; sample mode still refuses to pretend it analyzed the call.

```

## Local sign-in test output

```text

> build-sprint-app@1.0.0 test:chatgpt
> tsx tests/chatgpt-flow.ts

PASS: Local Convex rejects browser mismatch, expired callbacks and callback replay.
PASS: Browser-bound ticket creates a verified Convex session and cannot be reused.
PASS: Disconnect removes fixture credentials and sign-out returns to sample mode.
PASS: HTTP sign-in redirects to the official OpenAI flow; forged callback returns a safe failure.
NOT TESTED: Real OpenAI account consent, plan allowance, live story generation or token refresh. These need the owner's sign-in.

```
