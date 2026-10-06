# FirstChair Studio — product

Current decisions and implementation status, 6 October 2026.
This is the current product reference. PRODUCT_V1.md and IDEA_SCOPE.md retain historical context; their older journey and platform-label decisions do not override this document. MORNING.md records verification history.

## Purpose

Turn a public business website into useful, source-grounded carousel and static creatives with the business's own visual identity. The first result should show the reader a recognisable situation, offer a useful insight, and lead to a relevant action. Quality includes writing, imagery, brand fidelity and actual exported files.

The intended starting audience is founders and small marketing teams with a business website. This is a product hypothesis, not validated demand. Each submitted business's buyer and offer must be understood separately.

## Current user journey

1. Open the single-screen sky landing. Enter a website and click Create my posts.
2. For fresh local generation, connect ChatGPT first. Website reading starts while two short questions appear: desired outcome (awareness, enquiries or sales), then optional product/programme focus (Choose for me).
3. Save answers and continue generation. Show the actual saved stage; retain the sky and visual identity through onboarding, waiting and results.
4. Show one carousel and one static as the visible creative pair, with slide controls, captions, destination and evidence. Avoid duplicate platform tabs or Instagram/LinkedIn branding in this interface.
5. A connected owned pack supports one creative edit: a rewrite or manual text/image save. Brand corrections are separate and affect the pack. Keep unrelated posts unchanged and retain earlier versions.
6. Download one post or the complete ZIP. Copy captions separately. Publishing social posts is manual.
7. A connected pack whose export preparation was recorded can create a separate pack from another copy perspective. Export preparation is not proof that a file was saved or published.
8. Reopening a saved pack respects account ownership. Failures identify the step and allow appropriate recovery; saved evidence and drafts should survive.

Do not ask for team size, revenue, role, editing tools, referral source, current posting history or ad spend before delivering the first creative pair. The long Relay questionnaire is inspiration for fluid interaction, not the required information set.

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
