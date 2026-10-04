# Morning handoff — improved website-to-social creatives

## What works

The existing connected ChatGPT model now plans around a specific customer situation, chooses a coherent story and designs separate carousel and static ideas for Instagram and LinkedIn. Website font declarations, colours, logos and actual raster imagery guide the layouts. The model now inspects website photos before choosing how to use them, instead of relying on generic background-image labels.

Finished local packs are saved for Founder’s Find, Death Wish Coffee and Maid2Clean. Each has twelve 1080 × 1350 PNGs, a five-page LinkedIn PDF, captions, alt text, source evidence and posting destinations. All final images and PDF pages were visually inspected. Founder’s Find was completed first; the other businesses were tested through the shared generation process, without domain-specific production rules.

[See the finished statics](verification/quality-finished-statics.png). Full packs: [Founder’s Find](verification/quality-after-founders.zip), [Coffee](verification/quality-after-coffee.zip), [Cleaning](verification/quality-after-maid.zip). Full before/after copy and design comparisons are in [the creative review](design/creative-quality-review.md) and verification/quality.

Text edits, website-image changes, shared brand corrections, undo, full-pack and single-post downloads remain working. A selected AI revision preserved the other three posts and could be restored. The final cleaning pack was tested again for editing and downloads. No additional provider, local model or video generation was used. Nothing was deployed or pushed. Code, supplied reference-library guidance and representative before/after examples are saved in small local commits.

## Open it on your laptop

1. In Terminal enter `cd /Users/sam/build-sprint-app`.
2. Enter `npm run dev` and leave that window running. If it is already running, keep it open.
3. Open http://localhost:5173 in Chrome.
4. Use your existing ChatGPT connection, enter a website and click Create posts.

No extra API key is needed for this connected-plan flow. Saved connected-account packs require that same account; the labelled guest sample is not fresh AI analysis.

## What was actually checked

48 unit tests, frontend and Convex type checks, and the production build pass. Five browser-rendered layout fixtures pass, and excessive text is explicitly rejected. Existing build warnings about bundle size and an auth-library directive remain.

Actual Chromium runs verified all-slide previews, twelve correctly sized PNGs per pack, five-page PDFs, captions/destinations, saved reload, a 390px phone layout and no app browser errors. Signed-out readers cannot read owned packs. Final source-image planning was tested with fresh coffee and cleaning generations. Editing, restore, brand correction, one-static download and a source-image edit passed on the final cleaning pack.

Full final model output and browser results: verification/quality-after-founders-flow.txt, verification/quality-after-coffee-flow.txt and verification/quality-after-maid-flow.txt. Unit output: verification/quality-tests.txt. Editing output: verification/quality-edits.txt. Revision result: verification/quality-revision-result.txt. Actual PDF review images: verification/quality-after-{founders,coffee,maid}-pdf-contact.png. Fresh website screenshots and measured styles are verification/quality-source-{founders,coffee,maid}.{png,json}.

## What could not be finished and why

Exact proprietary fonts still need permitted font files. Palette inference misses some secondary colours, notably cleaning’s purple. Some copy remains academic or instructional, and English spelling can drift from the source brand. The renderer has five flexible families, not the full collage/illustration vocabulary of a design tool. The automatic reviewer checks structured copy and evidence, not finished exported pixels.

A verbose AI revision was too crowded to render at readable sizes; it was blocked, restored, and then revised successfully with concise feedback. Earlier model timeouts, a reviewer missing colour context and an overly restrictive process/list check were fixed; saved drafts now survive structure/review failures. Latency and plan limits remain. The final fresh image-led coffee and cleaning runs completed without draft recovery.

The tested packs are improved and inspectable, but universal zero-edit creative quality, exact brand fidelity and marketing performance are not established. Readable public English sites are the tested boundary; blocked pages and missing assets need recovery. PDFs embed the artwork and do not have selectable text. ZIPs and extracted full assets remain locally available generated files; representative PNGs, copy and proof sheets are committed.

Next: review the finished sheets and their originals, then try one unrelated website.

## Full sample transcript test output

This is the retained original transcript-flow test, separate from the website tests above.

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
