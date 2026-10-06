> Historical document. Current decisions are in [PRODUCT.md](PRODUCT.md). Older directions below are not the current specification.

# Website to Instagram and LinkedIn Creative Studio

Product and build specification, 4 October 2026. Draft for the next build handoff.

## Product promise

Enter a business website and receive polished, brand-specific carousel and static creatives for Instagram and LinkedIn, with captions and downloadable files. The content should speak to a recognisable situation the business's ideal customer faces, explain something useful, and offer one relevant next action.

The central product is the quality of the finished creative. A working download button does not establish that the output is good. “Best in class” is a quality ambition to evaluate with people and reference work, not an outcome to promise before testing.

## Scope and decisions

Confirmed: public website input; Instagram and LinkedIn; carousels and statics; finished downloads; brand-specific design and writing; GitHub and Convex; no video generation costs.

Proposed default: users download and publish manually. Direct social publishing is pending clarification and is not covered by this build sequence. Publishing the app itself is a separate final release step.

Proposed first audience for our app: founders and small marketing teams who own a business website and need organic social content. This is different from the audience of each submitted website, which must be researched afresh.

Proposed starting boundary: English output from readable public business websites. Other languages must be detected and labelled unsupported until tested. Accept any public URL for inspection, but promise successful extraction only where information and assets can be accessed. A blocked site gets a useful recovery path, never fabricated analysis.

One generation creates two distinct ideas: one five-slide carousel and one static. Each receives an Instagram and a LinkedIn version, giving four finished post previews. Versions may share a visual system and evidence but must adapt their opening, depth, caption and next action to the platform where useful. Do not force an unnatural professional angle onto a consumer product for LinkedIn.

Exclude reels, Wan, Seedance, AI presenters, generated photography, scheduling, analytics dashboards, ad buying, subscriptions, team workspaces, and a freeform design editor. Source imagery, typography and original simple diagrams are sufficient for the first quality test. Model writing still consumes the connected account's allowance; do not call this product cost-free.

## Smallest user journey

1. Paste a website URL and select Instagram, LinkedIn or both; default to both.
2. Click Create posts. Show truthful progress: Reading website, Understanding customers, Writing posts, Designing posts, Checking files.
3. Use the website's primary offer and action by default. Show a compact editable summary alongside results: business, intended customer, offer, market, tone and action.
4. Ask one focused question only if a missing or conflicting answer would materially change the result. For a business with several unrelated offers, ask which offer to feature. Do not turn onboarding into a questionnaire.
5. Show four actual rendered previews, clearly labelled by platform and format. Carousel previews support advancing through all five slides. Captions and intended destination appear beside each post.
6. Allow Edit text, Change image, Adjust brand details and Revise this post using a short instruction. Keep unrelated posts unchanged. A brand-wide correction explicitly affects all drafts; preserve the earlier version.
7. Download one post or the entire pack. Copy captions separately. Provide brief manual posting instructions and the destination URL.
8. Reload and recover the saved pack. Failures identify the affected step and offer an explicit retry without repeating successful paid work.

## Finished files

These are chosen V1 output specifications, not claims about every platform limit.

- Instagram carousel: five ordered 1080 × 1350 PNG files.
- Instagram static: one 1080 × 1350 PNG.
- LinkedIn carousel: a five-page PDF document with consistent portrait pages; also offer its five PNGs. A document upload produces LinkedIn's swipeable document experience.
- LinkedIn static: one 1080 × 1350 PNG.
- Full ZIP: folders by platform and post, ordered filenames, captions, suggested alt text, LinkedIn document title, and destination links. Never include account credentials or internal prompts.
- The PDF must preserve exact words and layout, embed permitted fonts or use an explicit fallback, and preferably retain selectable text. Inspect its actual rendered pages.
- Captions are final publishable copy. Notes about assumptions belong in the editor, not inside the creative or caption.

## Step 1 Collect evidence from the website

Start with the homepage and up to four relevant same-site pages: the featured product or service, About, Pricing when relevant, and one useful case study or FAQ. Use navigation and content relevance to choose them. Do not crawl the entire website.

Store each page's final URL, retrieval time, title, headings, meaningful content blocks, exact evidence excerpts and linked assets. Preserve section boundaries rather than flattening all text into one paragraph. Exclude navigation repetition, cookie notices and unrelated footer material.

Extract accessible stylesheets and inline styles. Identify headings, body text, primary buttons and prominent visual elements. CSS text alone is evidence of declared styles, not proof those styles were rendered. Mark that distinction.

Collect candidate logos, product photos, editorial images and real product screenshots. Record original URL, dimensions, type, nearby text, role and whether the file actually loads. Reject trackers, tiny icons masquerading as hero assets, irrelevant partner logos and broken images. Sanitize SVG files before use. Preserve product proportions and avoid cropping away critical product details.

Keep existing public-network protections: block private/local addresses, recheck redirects and asset URLs, bound download size and time, and treat all website content as untrusted reference material. Instructions on a website must never change the app's rules.

If access fails, allow pasted business text and uploaded brand assets. Label the pack as based on those inputs. Never pretend a blocked website was analysed.

Acceptance: inspect the source evidence for three different websites and confirm that the content, fonts, images and offer belong to the correct site.

## Step 2 Create a brand record

Record values, supporting evidence, confidence and fallback status for each field:

- Name and primary logo, including suitable light/dark versions when available.
- Colours by role: page background, text, primary accent and secondary accent. Frequency alone must not make a cookie banner's colour the brand colour.
- Headline and body font family, weight and style. Distinguish a declared font from an actually loaded usable font. Import only fonts that can be used legitimately; otherwise name the substitution.
- Image style: product-led, editorial photography, illustration, diagrams or typography. Derive it per brand rather than imposing one look across all businesses.
- Layout character: whitespace, alignment, corner treatment, borders and emphasis.
- Voice, with two or three examples from the site and explicit notes about what is inferred.
- Approved asset references and missing information.

Create a small brand preview using the actual selected fonts, colours and logo before writing the full pack. Reuse this record across every slide and platform version. A corrected record takes precedence over automatic guesses.

Acceptance: a reviewer can trace each important choice back to the website or a labelled user correction. No unrelated business inherits Founder’s Find's colours, typography, diagrams or offer.

## Step 3 Understand the customer and offer

For the ideal customer profile, meaning the specific type of person most likely to buy, record:

1. Who uses the product and who pays; these may differ.
2. The task they want to accomplish and the situation that triggers demand.
3. Their practical frustration, desired outcome and possible emotional tension.
4. Current alternatives and purchase objections, only where supported or clearly inferred.
5. Geography, currency, language, buying route and business/consumer market when supported. Do not infer selling territory from a domain ending alone.
6. The featured offer, its actual mechanism, supporting proof and appropriate next action.

Separate observed facts, reasonable hypotheses and unknowns. “The website says customers want faster reporting” is not the same as “customers fear looking incompetent.” The latter requires evidence or must remain a creative hypothesis, not customer testimony.

For ambiguous websites, ask one question about the offer or buyer. For sensitive subjects, speak respectfully about the problem without diagnosing the viewer, shaming them or manufacturing fear.

Acceptance: the record is specific enough that replacing the company name with an unrelated business would make it wrong. Unknown market or customer details remain unknown.

## Step 4 Choose content worth reading

Generate three internal candidate angles using the evidence, then select two distinct ones for the carousel and static. This does not require three separate model calls.

Each brief contains one customer situation, one useful insight, one supported connection to the offer, one next action and its destination. Include the evidence IDs supporting factual claims. Reject generic motivation, homepage summaries and vague promises such as “unlock your potential.”

The carousel must progress. A useful default is recognition of the situation, explanation of the problem, a concrete insight, practical application or supported proof, and an appropriate next step. Adapt the structure when the subject calls for another sequence. Each slide must add something; five versions of the same slogan fail.

The static must communicate one complete point at a glance. Its caption can explain more. It must not be the carousel cover copied into another file.

Write three possible hooks internally and choose based on audience specificity, clarity, relevance and evidence. Never label a hook “viral” or predict conversion from the model's own score.

CTA means the next action requested from the reader. Use a real destination that matches the offer. A button drawn inside an image is not clickable. Put LinkedIn destinations in the accompanying post text. For Instagram, show the intended profile-link destination as a posting instruction; do not assume the user's profile link has already been set. Avoid “comment X and we'll DM you” without a real fulfilment process.

Acceptance: a reviewer can explain who each post is for, why that person would care, what they learn, and what happens after the requested action.

## Step 5 Design the creative

Use a small collection of carefully designed layout families: editorial headline, image with commentary, useful checklist, supported comparison, process diagram and proof spotlight. Proof layouts are available only when the evidence exists. Choose a composition to fit the message; never invent data to fill a template.

Keep text, logos and layout as editable structured elements rendered by code. Use source photos when they improve the idea. Do not ask an image model to bake paragraphs into pictures. Do not default every business to text cards or every slide to an identical layout.

Preserve one visual family within a carousel while varying pace: a bold opening, quieter explanation and useful detail. Keep consistent margins, type hierarchy, colour roles, image treatment and logo placement.

Initial layout guardrails: 80-pixel outer safe area, body type approximately 40 pixels or larger on a 1080-pixel-wide image, and a short opening headline. These are starting design constraints, not a guarantee of readability. Measure actual text bounds and inspect at phone size. Rewrite excess text before reducing it below the readable minimum. Never silently truncate a sentence.

Acceptance: actual exported artwork is legible around a 360-pixel-wide phone preview, visually consistent with the source brand, free of clipped content, and clearly distinct from the other test brands.

## Step 6 Check before showing Ready

Run mechanical checks for correct slide count, dimensions, valid images, loaded fonts, text overflow, safe margins, supported file types and matching preview/export revision. Check each claim against its cited evidence; source excerpts must actually exist, and a true excerpt must genuinely support the claim.

Render the files and inspect the pixels. The build agent must do this locally during development. Automated production visual review is conditional on a supported model connection that can accept images; do not imply it exists just because the coding agent can see screenshots.

Use a five-point human rubric for brand fidelity, audience relevance, usefulness, visual craft and action clarity. Proposed release threshold: at least four in every category and no blocking defect. Fabricated facts, incorrect logos, unreadable copy, wrong destinations, broken downloads or wrong-brand assets are blocking defects regardless of the average score.

Allow one targeted automatic repair for each generation, within the overall cost and timeout budget. After that, preserve the draft and explain the issue. Do not loop indefinitely or hide bad output behind a Ready label. A model review is a check, not independent proof of marketing performance.

## Technical implementation choices

Use the existing React and TypeScript app. Keep Convex for server functions, saved packs, file storage and existing authentication. GitHub stores the code. Reuse installed libraries before adding more.

- Website retrieval: existing `publicWebsite.ts` plus Cheerio, the installed HTML reader. Extend page selection, asset collection and style analysis without weakening its network protections.
- Brand extraction: replace the current serif/sans shortcut with the evidence-backed brand record. Static HTML and CSS parsing cannot reliably recover every rendered website. Test the actual hosted extraction path early.
- Browser evidence: use the installed Playwright locally for screenshots, computed font inspection and tests. Local browser access is not automatically available to a deployed Convex action. If reliable production extraction requires an external browser service, present the concrete gap and cost for approval first; meanwhile support an honest manual brand correction/upload path.
- Writing: inspect and reuse the existing `planModel` connection only where authorised and demonstrably functional. Test access for the intended public users. Do not assume a developer's personal connected account can power every visitor, or that a coding subscription provides unlimited application usage. Do not expose tokens in the browser.
- Model selection: keep the writer replaceable. Record provider, model identifier, request count, duration and available usage metadata. Compare writing quality on the same saved briefs before changing models; no video model is needed.
- Rendering: one structured composition description must drive both previews and downloads. Prefer the existing rendering path where it passes visual checks. Await font and asset loading before export. Use the existing ZIP library. Choose one browser-compatible PDF library only after checking existing dependencies and verifying font/image fidelity.
- Stages: reading, analysing, writing, designing, checking, ready or failed. Store a generation ID and revision so stale jobs cannot overwrite a newer edit. Retry only failed work and cache reusable website analysis.
- Saved records: source pages and evidence; brand profile; audience/offer brief; post and slide content; layout and asset references; captions and destinations; review results; exported files; ownership and revision.
- Access: preserve current ownership checks. Before public launch prove that one user cannot access or revise another user's packs. Do not build a new account system unless the existing one fails the intended flow.

Initial usage budget: one structured brand/customer/angle call, one drafting call for both platform versions, one review call and at most one repair call. Cache extraction and brand analysis. A selected-post edit should not regenerate all four posts. This is a proposed engineering ceiling to measure, not a cost guarantee.

## Build milestones and evidence

Complete one milestone at a time. Save a short result and its evidence before proceeding.

1. Reconcile scope. Read current files, preserve unrelated work, identify legacy video paths to remove from the V1 interface. Confirm manual publishing and intended first users. Do not delete old data or rewrite authentication casually.
2. Establish quality references. Inspect the supplied static-ad board; obtain legible individual examples where its text is too small. Select three static and three carousel references with the founder. Record what makes them effective—hierarchy, pacing, evidence and image use—without copying their words or identity.
3. Build the evidence collector. Save an inspectable source bundle from three very different business websites. Include a JavaScript-heavy or blocked site to expose limitations early.
4. Build the brand and customer records. Review them against the source before any social post generation. Verify fonts, asset selection, market assumptions and corrections.
5. Build one excellent carousel and static for one brand end to end, including all four platform previews and files. Fix quality before expanding quantity.
6. Prove brand independence. Repeat for a visual product business and a local service business. No brand-specific code branches to make the benchmark pass.
7. Add targeted edits, persistence and failure recovery. Verify selected-post changes leave other posts unchanged; reload and download the latest revision.
8. Run the launch checks below and document failures. Review actual downloaded images and PDF pages, not just screenshots of the app.
9. Publish the app when authorised in the implementation chat: follow `.agents/skills/convex-dev-static-hosting/SKILL.md`, run `npm run deploy`, and verify the returned production `.convex.site` URL. A git push alone is not deployment. Repeat a complete real-user generation and download on the live site.

Relevant installed skills for the build agent: `copywriting` for audience-specific writing, `art-direction` for evidence-led per-brand visual decisions, `frontend-design` and `impeccable` for the app interface, `playwright` for browser checks, `convex-expert` for backend work, `convex-auth` only if authentication changes, and `convex-dev-static-hosting` for deployment. Read each when used. The app's own UI style must not become every customer's creative style.

## Launch checks

- Three successful full packs from materially different businesses, manually reviewed with the rubric.
- At least one fresh website not used while tuning layouts passes without custom code.
- A blocked site, ambiguous offer, unavailable font, missing logo and low-resolution image each produce an honest usable recovery path.
- Long headlines and paragraphs fit after rewriting; mobile previews remain readable.
- All twelve PNGs and both five-slide platform versions contain the approved revision; the LinkedIn PDF has five correctly ordered pages. Selected-platform runs export only the chosen platform.
- ZIP contents, captions, destinations and alt text are complete and belong to the correct business.
- An interrupted run and an expired model connection fail clearly without losing saved work or leaking credentials.
- Actual production model access, asset loading, browser exports and ownership checks pass for the intended user flow.
- The founder approves each benchmark pack as usable without rebuilding it in Canva. Record actual editing effort and time to the first usable pack. Later measure audience response; do not equate internal design scores with clicks or sales.

## Current implementation observations

Read on 4 October 2026; another build is changing these files, so verify again before editing. Current `IDEA_SCOPE.md` already specifies an Instagram carousel and static, source-backed writing, font/colour/logo extraction, and no reels. LinkedIn is absent from that scope. `brandStyle.ts` currently maps CSS evidence into bundled serif/sans fallbacks. `studioWriter.ts` writes two Instagram pieces and checks source excerpts, using three layout choices. These are useful foundations, not proof that this new specification is implemented.

`MORNING.md` mixes newer corrections with older video and provider notes. Reconcile the final handoff once the active build finishes so it describes the current product without contradictory completion claims.

No application code, live deployment or existing scope file was changed while preparing this document.

## References and verification boundaries

- LinkedIn document upload: https://www.linkedin.com/help/linkedin/answer/a519831
- Convex runtime limits: https://docs.convex.dev/production/state/limits
- Playwright page evaluation: https://playwright.dev/docs/evaluating
- Local evidence: `/Users/sam/build-sprint-app/IDEA_SCOPE.md`, `convex/website.ts`, `convex/publicWebsite.ts`, `convex/brandStyle.ts`, `convex/studioWriter.ts`, `package.json` and the installed skills above.

This document specifies the next work. It does not certify creative quality, extraction fidelity, public-user model access or deployment until those checks have actually passed.
