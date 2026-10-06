# FirstChair Studio — product

Current decisions and implementation status, 6 October 2026.
This is the current product reference. PRODUCT_V1.md and IDEA_SCOPE.md retain historical context; their older journey and platform-label decisions do not override this document. MORNING.md records verification history.

## Product promise

FirstChair Studio helps a solopreneur turn their product website into editable, brand-aligned carousels and static posts for organic marketing. Start with a useful creative rather than a blank canvas: review the story, make a focused correction, and download a post ready to publish.

The goal is to give a stretched founder back time while producing content that serves a clear marketing purpose. “Content that does the job” means a relevant idea for the intended buyer, an accurate explanation of the offer, recognisable brand design and a useful next action. It is not a promise of reach, leads or sales before those outcomes are measured.

## Primary customer and problem

The primary customer is a solopreneur who owns a product or business website and creates their own organic marketing content. Small marketing teams are a possible later audience; they should not drive the first journey.

The founder already divides their time between building, selling and running the business. When they need a post, they often end up in Canva deciding what to say and how to make it look like their brand: which template, font, font size, colours, product image, spacing and layout to use. The work is more than moving text into a template. They must find a worthwhile story, make the design coherent, and check that the result explains their product accurately.

This is the problem hypothesis supplied by the founder of FirstChair, not a completed customer-research finding. Validate where the time goes and what users consider publishable through observed tasks and interviews.

## Job to be done

“When I need to market my product organically, help me turn what is already on my website into useful, on-brand posts I can adjust and publish, so I can spend less time writing and designing from scratch and more time running my business.”

FirstChair should make the first meaningful decision for the user: propose a supported story and a fitting design. It should retain the user's control over the result through focused editing. Asking the founder to recreate their brand guide, fill in a long brief or rebuild the creative elsewhere would undermine the time-saving purpose.

## Relay inspiration and separate journeys

Relay Studio is the user's reference for a reels-focused product and a fluid onboarding experience. FirstChair's product is editable carousels and static posts. These are separate products and separate user journeys; Relay's questionnaire, video workflow, publishing choices and sales narrative are not FirstChair requirements.

Borrow the interaction principles: a strong first screen, few words, one meaningful decision at a time, smooth transitions and useful questions while work happens in the background. Design the rest around FirstChair's own task: understand the website and buyer, create a static/carousel pair, let the founder inspect and edit it, then export.

## What FirstChair takes off the founder's plate

- Finding a useful content angle from the actual product, buyer situation and website evidence.
- Carrying the brand's colours, typography, logos and relevant imagery into the creative.
- Choosing readable font sizes, spacing and a layout that suits the story.
- Turning an idea into a coherent carousel or a complete static post, with a caption and relevant next action.
- Preparing ordered files for manual publication while keeping the working version editable in FirstChair.

“Editable” currently means text/image corrections, a requested rewrite and brand adjustments inside FirstChair, subject to the existing one-creative-edit allowance. Downloaded PNGs are flattened images, and a downloadable layered design or Canva-editable file is not currently implemented. The edit limit should be evaluated against the goal of reaching a publishable result without sending the founder back to another design tool; this document does not change that limit.

## Success criteria

Measure time from website entry to the first creative the founder accepts as publishable, active time spent correcting it, and whether they need to rebuild it in Canva. Compare these with the same founder completing a comparable task in their usual workflow. Track brand accuracy, source accuracy and how much of the proposed story/design they retain. Measure generation waiting time separately from the founder's active effort.

Later, measure actual organic-marketing outcomes for published posts. An internal quality score, successful export or saved sample does not establish that the content performs. No numerical time-saving or conversion claim has been validated yet.

## Current user journey

1. Open the single-screen sky landing. Enter a website and click Create my posts.
2. For fresh local generation, connect ChatGPT first. Website reading starts while two short questions appear: desired outcome (awareness, enquiries or sales), then optional product/programme focus (Choose for me).
3. Save answers and continue generation. Show the actual saved stage; retain the sky and visual identity through onboarding, waiting and results.
4. Show one carousel and one static as the visible creative pair, with slide controls, captions, destination and evidence. Avoid duplicate platform tabs or Instagram/LinkedIn branding in this interface.
5. A connected owned pack supports one creative edit: a rewrite or manual text/image save. Brand corrections are separate and affect the pack. Keep unrelated posts unchanged and retain earlier versions.
6. Download one post or the complete ZIP. Copy captions separately. Publishing social posts is manual.
7. A connected pack whose export preparation was recorded can create a separate pack from another copy perspective. Export preparation is not proof that a file was saved or published.
8. Reopening a saved pack respects account ownership. Failures identify the step and allow appropriate recovery; saved evidence and drafts should survive.

Do not ask for team size, revenue, role, editing tools, referral source, current posting history or ad spend before delivering the first creative pair. Question choices must help produce the first useful creative; Relay’s separate journey does not define FirstChair’s information requirements.

## Sample preview

The top-right Sample preview opens a separate scrolling collection. Each website name and link sits above two creatives: static first, carousel second, with previous/next slide controls. Returning preserves the active studio pack.

The collection contains saved exports for The Whole Truth Foods, Go Zero, Suva Life, Buffer, Ugmonk, Allbirds, Death Wish Coffee, Maid2Clean, Founder's Find and Basecamp. These include reviewed/edited examples, not a guarantee of unattended quality. Files are bundled with the app rather than dependent on temporary saved-pack image links. The landing remains one screen; this collection and the result workspace can scroll.

## Generation and accuracy

Read the homepage and a bounded selection of relevant same-site pages. Preserve URLs, page/section context, exact excerpts, qualifications, negations and source warnings. Use actual source images and available fonts; label fallbacks. Match the selected offer, intended buyer, imagery and destination.

The pipeline includes website extraction, planning, writing, review, structured validation and browser rendering. The output is a declarative creative specification, not model-authored executable code. Unsupported claims, fabricated testimonials, invented outcomes and unrelated imagery must not be accepted merely because a source string is present.

Current evidence checks and reviews are useful safeguards, not proof of semantic accuracy. The other account's audit is analysis only; its proposed improvements have not been integrated. Priorities: explicit buyer/offer context, evidence eligibility in execution, claim-to-evidence links preserving qualifications, relevant image/action selection, insufficient-evidence recovery and review of the exact final merged creative pair. Compare baseline and candidate on identical saved inputs plus unfamiliar websites. Inspect exports as well as text. Do not describe this prompt/rule work as training a new underlying AI model.

## Output contract

One carousel and one distinct static idea; current carousel validation supports 3–7 frames, not an obligatory five. Existing internal platform variants and exports remain supported although duplicate platform previews are hidden. Images are 1080 × 1350. A full pack includes ordered PNGs, captions, destination/source information and the existing document export. This change does not add video, automatic social publishing, scheduling, analytics, ad buying, subscriptions or team workspaces.

## Local versus public availability

Local: http://localhost:5173/ with local Convex backend on 3210 and HTTP actions on 3211. The user connects their ChatGPT account through the local sign-in flow. Account allowance and connection validity determine availability; no API billing has been configured. Latest local check established a working landing and a sign-in redirect, not a new successful authenticated generation run.

Public: https://rightful-wombat-262.convex.site/ serves the landing, saved gallery and curated sample flow. Fresh anonymous generation is blocked before website reading; old unsupported anonymous packs show a clear message instead of spinning. ChatGPT plan sign-in is currently loopback-only. Public fresh writing/revisions need a separately supported production connection and usage controls. No paid budget has been approved.

Website requests share a 20-second absolute deadline across address lookup and redirects. The writer has a ten-minute deadline and the workflow has a twelve-minute fallback. These are failure bounds, not target generation times or measured speed claims.

## Build and maintenance

Project: /Users/sam/build-sprint-app. React/Vite frontend; Convex database, functions, authentication and static hosting. Use existing tools and project skills. npm run dev starts local work; npm run check checks frontend/backend types; npm test runs automated checks; npm run build produces the frontend; npm run deploy publishes to Convex. Saving code does not deploy it. Do not introduce another host, database or authentication provider.

Code is saved in local version history. No online code backup is confirmed. The Codex backup tool currently needs sign-in; earlier creation also failed because the account had no repository workspace. Public app publication and source-code backup are separate.

## Current verification and next work

The saved gallery was inspected locally and publicly; carousel next-slide control worked locally. Build and frontend/backend checks passed for that change. The preceding generation reliability change passed 99 automated tests. Do not report those tests as newly rerun for documentation changes. PDF page counts in earlier tests do not establish independent PDF visual acceptance.

The other ChatGPT account receives a source ZIP and iterates within its conversation. It has no direct write access to this Mac. Interim local tests require bringing changes here; a final changed-file package is requested only when the user is ready. Returned changes must be checked and tested before integration or publication.

Next product milestone: a fresh connected local run through onboarding, reviewed creatives, one edit and export, followed by evidence-based recommendation improvement. Billing and public live-generation integration are deferred.
