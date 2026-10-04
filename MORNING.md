# Morning handoff — website to finished social creatives

## What works

Enter a readable English business website, choose Instagram, LinkedIn or both, and receive a five-slide carousel plus a distinct static for each selected platform. Both platforms give four rendered previews and twelve 1080 × 1350 PNGs; LinkedIn also gets a five-page PDF. Each post includes a caption, destination, suggested alt text and manual posting instructions.

The app reads the homepage and up to four relevant same-site pages. It saves the actual page evidence, plans three content angles with short alternative hooks, selects two ideas, then checks copy against the sources. The connected ChatGPT writer uses your existing allowance. This scope makes no paid image or video requests.

Creatives use website colours, declared heading/body font character, the primary logo when readable, and relevant real website photographs. There are seven purposeful layout families: editorial, comparison, checklist, process, insight spotlight, source image and closing. Cover graphics reuse meaningful comparison labels from the story. No generated faces, invented testimonials or fake charts. Partner logos are excluded from brand-logo selection.

Source fonts that can be imported from the supported open-source list are loaded from Convex storage. Proprietary or unreadable fonts use explicitly named Inter/Georgia substitutes; this is not exact proprietary font reproduction. CSS declarations are labelled as evidence, not proof of the live site's full rendered design.

You can edit one post's words or image, type feedback for one platform/format, correct brand details across every preview, upload a logo/photo and restore the previous version. Saved source and completed drafts survive a failed model review; retries reuse that work. Website-reading errors offer pasted business-text recovery, labelled as provided input. Long copy blocks downloads instead of being cut off or silently shrunk below the reading-size floor.

Nothing was deployed or pushed. Work is saved in small local commits. The source inspiration board remains at `design/inspiration-library/assets/static-ads-board.png`; only broad compositions are used because its small copy is unreadable. No live Meta ads were imported.

## Open it on your laptop

1. Open Terminal and enter `cd /Users/sam/build-sprint-app`.
2. Enter `npm run dev` and leave that window running. If it is already running, keep it open.
3. Open http://localhost:5173 in Chrome.
4. Use the existing connected ChatGPT writer, enter a website and click Create posts.

No additional API key is needed for the current connected-plan carousel/static flow. The labelled guest Founder’s Find sample is a curated sample, not a new live generation. Other sites require a connected writer.

## What was actually checked

- Forty-two rule tests pass; both frontend and Convex type checks pass; production build passes. The build emits bundle-size and existing auth-library directive warnings, but finishes successfully.
- Real Chromium generation/export checks passed on Founder’s Find, Death Wish Coffee and Maid2Clean. Each full pack has twelve correctly sized PNGs, a five-page LinkedIn PDF, captions, alt text and destinations. Reload, 390px phone layout and absence of browser errors passed. Signed-out access to owned packs is blocked.
- Founder’s Find feedback revised only its Instagram static, preserving the other three posts exactly.
- Browser edit checks passed: one-static text edit, unchanged other posts, undo, brand-wide colour correction and undo including saved fonts/logo, single-static ZIP download, and selecting a verified source photograph for the Maid2Clean carousel cover. That benchmark retains this explicit manual image edit; it is not presented as an automatic generation result.
- Every final PNG and rendered PDF page was inspected in contact sheets. The actual source sites and measured browser fonts/colours are stored alongside the exports. Three tested brands demonstrate the flow, not universal brand fidelity or conversion performance.

The final Founder’s Find re-export is `verification/creative-founders-final.txt`; its feedback proof remains in `creative-founders-flow.txt`. The visual review is `design/brand-quality-review.md`. Full website-test outputs, including complete generated content, are in `verification/creative-founders-flow.txt`, `verification/creative-coffee-flow.txt` and `verification/creative-maid-flow.txt`. Edit-check output is `verification/creative-edits.txt`; unit output is `verification/creative-tests.txt`. Review images are `verification/creative-founders-contact.png`, `verification/creative-coffee-contact.png` and `verification/creative-maid-contact.png`.

## What could not be finished and why

- Exact proprietary typography remains unavailable without permitted font files. Death Wish Coffee's Revans/Fenomen and Maid2Clean's custom font aliases receive named substitutions; Founder’s Find's Georgia/Inter can be represented more closely. There is no arbitrary website-font copying.
- The PDF preserves the PNG artwork exactly; its text is not selectable. This is disclosed in the exported sources and PDF metadata.
- Extraction cannot guarantee access to every website. Only readable public English business websites are supported; conflicting multi-offer websites need human review. Pasted-text recovery, fresh public-account consent, a different signed-in owner's access, expired connection, and every possible interrupted-run case have not all been browser-tested in this round. Do not treat these as completed launch checks.
- Source assets are best effort, limited in number and size. Some valid brands still fall back to a text wordmark or diagrams. Uploaded fonts and fully editable vector documents are outside this version.
- The model checks structured words and source grounding, not rendered pixels. Browser file checks catch fit problems; human review is still needed before calling a new brand's pack ready without editing. No founder acceptance or measured marketing results have been recorded yet.
- Reels, avatars, generated photography, direct social publishing, ad buying and external integrations are outside the current scope. They require no keys for this build.

Next: review the three benchmark sheets, then try one new business website and judge the actual downloaded creatives.

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
