# Morning handoff — any website to carousel and static

## What works

- Enter a readable public website. The connected writer creates one five-slide carousel and one static, each with a short hook, useful content, a source-supported call to action and caption.
- The website flow contains only Carousel and Static. No reels, talking avatars, generated faces or paid image requests.
- Each website supplies its own offer and audience, observed colours, heading font family and accessible logo. The layouts are reusable headline, comparison and note compositions inspired by the supplied static-ad board.
- Download six 1080 × 1350 PNGs with captions and sources in a ZIP. Type feedback to change one piece; the other stays unchanged.
- Missing logos use the brand name as text. Proprietary website fonts are substituted with bundled Inter or Georgia, and this is explained in the app. Missing colours use a clearly explained neutral palette. Website colours are inferred from public CSS, not a formal brand guide.
- Founder’s Find, Basecamp and Death Wish Coffee have passed real Chromium generation, download, reload and desktop/mobile checks. Founder’s Find also passed one-post feedback and preservation of the carousel. Every brand’s six images were visually inspected; a missing small footer found during inspection was corrected and re-exported.
- Nothing was deployed or pushed. Changes are saved in small local commits.

## Open it on your laptop

1. Open Terminal and enter `cd /Users/sam/build-sprint-app`.
2. Enter `npm run dev` and leave it running. If it is already running, use that window.
3. Open http://localhost:5173 in Chrome.
4. Use the existing connected ChatGPT writer and enter a website. No additional image/video API key is needed for this scope.

Guest Founder’s Find output is labelled sample mode. Other websites require a connected writer; they do not silently receive fake content. The local tests used an already approved ChatGPT connection and do not retest the external consent screen.

## What could not be finished and why

- Exact proprietary font matching is not implemented: the renderer uses a matching serif/sans family instead of importing arbitrary website font files.
- The reader cannot guarantee access to every website. Sites that block requests, require sign-in or provide too little readable text produce a clear error. The current reader uses the supplied page, not a full multi-page crawl.
- Logo import is best effort. Inline SVG logos and some unusual image markup fall back to a text wordmark.
- Meta ad-library import remains unavailable without approved access; no competitor ads are invented. The supplied board is stored in `design/inspiration-library/assets/static-ads-board.png`; its small individual copy cannot be read reliably. Broad composition patterns are recorded, with no performance claims.
- Reels, avatars and video-provider access are outside the latest approved scope and are not blockers for carousel/static output.
- The three tested sites prove the general flow, not perfect design fidelity or conversion performance for every brand.

## Checks and full output

- `verification/check-agnostic.txt`: frontend and Convex type checks.
- `verification/tests-agnostic.txt`: 36 automated checks, including two-format rules, font extraction, colour aliases, modern colour formats and default theme preservation.
- `verification/build-agnostic.txt`: production build.
- `verification/agnostic-founders.txt`, `verification/agnostic-basecamp.txt`, `verification/agnostic-coffee.txt`: full live output and browser results. Each contains a saved pack URL.
- `verification/export-agnostic.txt`: corrected exports after the footer fix.
- `verification/foundersfind-club-contact.png`, `verification/basecamp-com-contact.png`, `verification/www-deathwishcoffee-com-contact.png`: all six images per brand.
- Matching `*-desktop.png` and `*-mobile.png`: interface screenshots.
- Matching `*-instagram.zip`: local downloadable files, ignored by Git.

To rerun the real browser flow: `npx tsx tests/website-flow.ts`. For another website: `TEST_WEBSITE=https://basecamp.com/ SKIP_REVISION=1 npx tsx tests/website-flow.ts`. This uses the existing local writer connection.

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

## Avatar export fixture output

```text
PASS actual browser decodes footage, overlays approved copy, retains source audio and exports MP4
Fixture uses a still fictional portrait and original music, NOT a live Seedance avatar.
PASS source audio retained: decoded waveform correlation 1.000000, codec alignment offset 0.00 ms
Fixture audio is original music; no live Seedance speech is claimed.
```

## Website-specific image checks

```text
PASS missing image access is labelled and cannot start a paid request
PASS real Convex storage image URLs change the real exported PNG {"width":1080,"height":1350,"bytes":548207}
PASS unreadable image URLs fail explicitly
```

## Full-scope completion audit

1. **Website analysis and three content formats — verified.** Founders Find and Basecamp passed connected generation in a real browser. The saved pieces have short hooks, audience pain and inferred emotion, useful advice and a CTA. Exact source excerpts and claim/copy review gate saving. Evidence: `website-flow.txt`, `second-website-flow.txt`, `live-website-pack.json`.
2. **Feedback on one piece — verified.** Typed static-post feedback changed that post while the carousel and reel remained byte-for-byte unchanged. Evidence: `website-flow.txt`.
3. **Original imagery — partly verified.** The first pack includes original AI-generated fictional photography, with provenance. Website-specific Seedream requests, genuine JPEG/PNG validation, real Convex storage and PNG export are verified independently. Live image generation and visual approval remain unverified because provider access is missing. Shared artwork is labelled.
4. **Downloadable images and video — verified for the existing pack.** Six 1080 × 1350 PNGs, captions and a 1080 × 1920 H.264/AAC MP4 download in Chromium. Desktop/mobile and reload checks pass. The inspected copy is complete and readable. This does not prove that every future website or generated video is ready to share without review.
5. **Speaking AI avatar — incomplete.** Seedance requests, task polling, storage and branded export are implemented. Fixture export preserves the source audio exactly with zero measured shift. No genuine speaking-avatar output has been generated or inspected, so full ready-to-share avatar output is not claimed.
6. **Real ad inspiration when accessible — access unavailable.** Public Meta access returned 403; the approved API credentials are absent. The adapter never invents ads and retains safe public source links. Zero ads were imported.
7. **Brand voice and presentation — verified with limits.** Voice and emotions are explicitly inferred from public offer material. Founders Find uses observed website colours and Inter font, not a claimed formal brand guide. Other websites use observed colours when readable and a labelled neutral template otherwise.
8. **Convex stack and no deployment — met.** Backend, database, workflow and media storage use Convex. The running app and backend are local. No deployment or push was performed. Working steps are committed locally; no CRM, social-account connections or extra posting channels were added.
9. **Morning handoff and full transcript test output — met.** This file includes opening steps, provider keys, limitations and the entire retained transcript test output. Website and media proof files are linked separately.

The goal is **not complete**. The recurring provider-access blocker is now the limit on meaningful further verification: add `ARK_API_KEY` in Convex with Seedream 4.5 and Seedance 2.5 access/credits, then generate and visually review real images and a speaking avatar before claiming the full result is share-ready. Meta approval/access is separately required for real ad imports. No credits were bypassed and no provider output was fabricated.
