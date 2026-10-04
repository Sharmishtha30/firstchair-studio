# Morning handoff — website to Instagram

The website studio has been tested in a real Chromium browser with Founders Find and Basecamp. Nothing was deployed or pushed.

## What works

- Paste a public website; the connected writer reads its offer and produces a carousel, static post and reel with short hooks, value, a call to action and captions.
- Claims are checked against website excerpts. Incomplete copy gets one repair attempt, then an explicit error rather than an endless wait.
- Feedback changes one selected post and keeps the other two unchanged; this was checked in the browser and saved data.
- Download six Instagram PNGs and captions in a ZIP, plus a vertical MP4 reel with music embedded in the file. Founders Find exports use its actual website colours and Inter font.
- Original AI-created fictional workplace portraits are included. The motion reel uses a still portrait; it is not a speaking avatar.
- Guest Founders Find output is prominently labelled sample mode. Real connected output is labelled separately.
- The previous transcript writer remains available from the footer.

## Open it on your Mac

1. Open Terminal and enter `cd /Users/sam/build-sprint-app`.
2. Enter `npm run dev` and leave that window running.
3. Open http://localhost:5173 in Chrome.

The latest saved Founders Find pack is linked in `verification/latest-pack-url.txt`. Downloaded files are `verification/founders-instagram.zip` and `verification/founders-reel.mp4`.

## What is unfinished and why

**Talking AI avatar:** the Seedance 2.5 connection is implemented but not tested against the real provider because no `ARK_API_KEY` is configured. The existing MP4 is a motion reel, not lip-synced speech. A new branded avatar download path composites approved text cards and the website address over real provider footage while copying its original AAC speech without re-encoding. The fixture audio check measured an identical decoded waveform and zero timing shift. Non-AAC provider audio produces an explicit error rather than a silently altered soundtrack. This export was verified in Chromium with an explicitly fictional still-portrait/music fixture, not live Seedance footage. Text cards follow five equal scenes; they are not word-timed subtitles. Evidence is in `verification/avatar-export-check.txt` and `verification/avatar-export-proof.json`. Get a ModelArk key at https://ai.byteplus.com/ark/region:ap-southeast-1/apikey, then run `npx convex env set ARK_API_KEY` in this project and paste the key into its private prompt. Set it in Convex, not the frontend `.env.local`. BytePlus model access and credits are separate from ChatGPT Pro. Mock checks cover requests and result handling; they do not prove live avatar quality.

**Real ad inspiration:** Meta's public library returned HTTP 403. No ads were imported or invented. The API adapter needs approved Meta access, `META_AD_LIBRARY_TOKEN` and `META_GRAPH_VERSION` from the Meta app dashboard. Its commercial coverage includes UK/EU ads; an India-only commercial campaign is not automatically available through the API. Reference: https://br-fr.facebook.com/ads/library/api/ . Saved public ad links contain no provider access tokens.

**Images for other brands:** a Seedream 4.5 adapter now builds two image briefs from the actual offer, audience, pain points and brand colours. Once `ARK_API_KEY` and Seedream access are enabled, new connected packs automatically request a scene and a fictional presenter using BytePlus image credits. Failed requests can be retried explicitly; already saved images are retained. The form explains these requests when the key is configured. Missing access leaves prominently labelled shared sample artwork, not purported fresh imagery.

The request contract and JPEG/PNG parsing passed mock checks using real image bytes. The official API reference restricts `output_format` to newer models, so Seedream 4.5 requests omit it and retain the original returned JPEG or PNG. A browser test uploaded a temporary fixture to actual Convex storage, loaded its storage URL into the artwork renderer, exported a changed 1080 × 1350 PNG and removed the fixture. This proves storage and export, not live Seedream generation or the artistic quality of its results. Provider access is still missing, so full Relay-style output remains incomplete. Seedream uses the same `ARK_API_KEY` as Seedance; enable the image model separately in ModelArk. Official API reference: https://docs.byteplus.com/en/docs/modelark/image-generation-api .

## Checks and evidence

- Type checks and production build pass; 31 automated checks pass.
- `verification/website-flow.txt`: full connected Founders Find browser generation, one-post revision, preservation of the other two, ZIP and MP4 downloads, refresh and honest provider status.
- `verification/second-website-flow.txt`: connected Basecamp website generation and downloads.
- `verification/website-deadline.txt`: three checks prove old deadlines cannot kill newer work, stalled jobs become errors, and late results cannot overwrite a failed job.
- `verification/browser-final-studio.txt`: saved-pack desktop/mobile and export checks.
- `verification/contact-sheet-final.png`: all six exported PNGs inspected for readable complete copy and overlap.
- `verification/video-proof.json`: actual MP4 has H.264 video at 1080 × 1920, AAC stereo music at 48 kHz, approximately 25 seconds.

These checks used the existing approved ChatGPT connection. They do not re-prove the external consent screen, live Seedance generation or Meta access. The latest sample banner, transcript route, saved-pack reload, desktop/mobile views and ZIP/MP4 downloads also passed browser checks (`verification/ui-final-check.txt` and `verification/browser-final-studio.txt`).

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
