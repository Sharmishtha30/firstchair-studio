> Historical reference — not current implementation instructions. As of 13 October 2026, `CONTENT_PROCESS.md` governs generation: website colours/fonts only; article or transcript supplies all content; frozen layout. Older website-content, sales-angle, logo/image and variable-layout directions below are superseded. Historical results are not new verification.

# Creative quality pass — 5 October 2026

This is a review of actual exported files, not a quality score inferred from passing tests. The final packs use the existing connected ChatGPT writer and local Convex backend. Nothing was deployed or pushed, and no image or video generation provider was added.

## Finished packs

Each ZIP contains twelve 1080 × 1350 PNGs: five carousel slides and one static for each platform. It also contains the five-page LinkedIn PDF, captions, alt text, source evidence and posting destinations.

- Founder’s Find: [all exported images](../verification/quality-after-founders-contact.png), [download pack](../verification/quality-after-founders.zip), [before/after designs](../verification/quality/founders-before-after.png), [full copy comparison](../verification/quality/founders-copy-before-after.md).
- Death Wish Coffee: [all exported images](../verification/quality-after-coffee-contact.png), [download pack](../verification/quality-after-coffee.zip), [before/after designs](../verification/quality/coffee-before-after.png), [full copy comparison](../verification/quality/coffee-copy-before-after.md).
- Maid2Clean: [all exported images](../verification/quality-after-maid-contact.png), [download pack](../verification/quality-after-maid.zip), [before/after designs](../verification/quality/maid-before-after.png), [full copy comparison](../verification/quality/maid-copy-before-after.md).

The Founder’s Find pack was completed, exported and visually inspected before testing the two unrelated businesses. A later image-planning improvement was tested with fresh generations for coffee and domestic cleaning. Final benchmark copy is model-generated; temporary text, colour, image and feedback edits were restored before the exports used here.

## What changed in the writing

Founder’s Find’s old static addressed a delivery-company simulation as though the delivery buyer were the customer. The new static, “A score is not yet feedback,” addresses the professional choosing a way to practise judgement. The carousel opens “Your CV shows delivery. Where are the decisions?” and progresses from delivery versus judgement to describing one real decision, examining marked practice, and trying the actual three-call example. Simulation evidence remains labelled as practice rather than work experience.

Coffee moves from a generic format-warning opening to “New flavour. Same coffee setup.” The story follows a recognisable reorder moment: start with your existing brewing format, inspect actual Coconut Caramel coffee/pod listings, check another flavour’s format, then browse the relevant collection. The independent static, “Read past the white chocolate,” makes a small but concrete point about the source’s sweet/earthy flavour pairing. It uses the actual product photograph rather than inventing tasting testimony.

Cleaning moves from a supplies checklist to a buyer’s choice: “Meet first. Decide who cleans your home.” The static explains that an introduction is a chance to discuss tasks and approve the proposed cleaner, not an obligation to accept. The carousel, “Choose the jobs before the hours,” distinguishes room count, contents, depth and priorities. Its illustrative task list is an example, not a promised cleaning schedule. The captions point to the relevant inspected FAQs.

The writer no longer needs a fixed sequence of recognition, explanation, checklist and CTA cards. Mandatory template mixing, the eight-word hook rule and forced list items were removed. Five slides remain the approved product/export format in PRODUCT_V1.md. Source quotations, valid destinations, asset ownership and complete sentences still have checks.

## What changed in the design

A bounded design object lets the model choose essay, poster, split, photo or list layouts, surface colour, alignment, image position, selected emphasis and a takeaway. These are safe rendering choices; model-generated HTML or JavaScript is never executed. Headline and body space are measured together rather than placed into inflexible boxes. Comparisons use meaningful columns; lists receive measured rows; takeaways get their own space. Emphasis can span wrapped lines. Product photographs retain their proportions.

The initial image problem was concrete: the model received vague background-image labels, so it could not assess suitable imagery. Planning now sends bounded raster image bytes through the same connected model, with asset keys. The saved brief describes what is visible, what is not established, and suitable uses. The coffee and cleaning final packs demonstrate actual source-image selection without a brand-domain branch. Image input follows [official OpenAI documentation](https://developers.openai.com/api/docs/guides/images-vision); support was also verified through this existing connection, rather than assumed from the documentation.

Founder’s Find uses the site’s serif/sans contrast, pink emphasis, black and white, and generous spacing. The coffee pack uses black, red, heavy serif type and its actual packaging. Cleaning uses white, peach accents, the real logo and a source bedroom photograph; the photograph supplies home context without claiming that the pictured person is a cleaner or customer.

The founder-supplied GOLDEN_SET was read first. Set001 contributes premise/detail/interpretation and selective emphasis; Set003’s written observations suggest imagery-led alternatives. Missing Sets002/004 and absent Set003 image files remain missing. The expanded static-family catalogue already available in the shared workspace was preserved and wired into planning, drafting and review. Its screenshots are inspiration, not published assets, proof or brand facts. The model receives textual reference-family guidance; it does not receive the reference screenshots as vision inputs. The archived originals are saved under design/inspiration.

## Evidence and failures

- Inspected all twelve final PNGs per brand, all five rendered PDF pages per brand, and full-size coffee/cleaning statics. The review sheets come from extracted ZIP files and rendered PDFs, not simulated mockups.
- Actual browser exports passed on all three sites: twelve correctly sized PNGs, captions, destinations and a five-page PDF; saved reload, all-slide preview, 390px phone layout and no app browser errors. Owned connected packs are inaccessible to signed-out readers.
- Browser editing passed on the final image-led cleaning pack: change only one static, unchanged other posts, restore, shared brand colour correction and restore including fonts/logo, a one-PNG static download, selecting a source image for the cover and restoring the original.
- A selected AI static revision on the earlier cleaning pack preserved the other three posts exactly and could be restored. Its first verbose checklist did not fit the readable-type floor and was explicitly blocked. A concise feedback request produced a renderable revision. That summary is in verification/quality-revision-result.txt; it is not represented as a raw full-model-output log.
- 48 unit tests, frontend/Convex type checks and the production build pass. Five real browser-rendered layout fixtures pass; excessive text fails rather than clipping. Existing auth-library directive and bundle-size build warnings remain.

There were real generation failures during development: the combined four-post draft timed out; a reviewer lacked the collected colour evidence and incorrectly rejected it; and a semantic “process” label was incorrectly forced to have list items despite an essay design. Drafting is now split by platform, reviews receive the same CSS evidence, and structure checks follow the actual layout. Completed drafts are saved before validation, so retry can reuse them. The original failed cleaning draft was recovered from the actual saved model response, never invented. Later fresh image-led coffee and cleaning runs completed and exported without draft recovery.

Complete final model outputs and browser results are in verification/quality-after-{founders,coffee,maid}-flow.txt. Raw before/after content and captions are in verification/quality. Earlier text-led improved drafts are retained there too. ZIPs and extracted full asset directories are local generated files, excluded from git; representative full-size PNGs, copy and comparison sheets are committed.

## Remaining weaknesses

- This is stronger editorial work, not proof that every new website yields a Canva-level pack without review. Some hooks are still instructional; Founder’s Find’s “gap inspectable” wording is more academic than ideal. Coffee’s output uses British “flavour” despite the site’s American spelling. Brand voice remains imperfect.
- Original proprietary fonts remain unavailable: Revans/Fenomen and Maid2Clean’s cm/cr aliases use labelled substitutions. Founder’s Find is closer. Cleaning’s purple secondary surface is not fully captured by the current palette inference; matching peach and the logo is not complete brand fidelity.
- The five rendering families are still a limited visual vocabulary. Larger full-bleed scenes, collage, annotations and bespoke illustrations are not implemented. The reference catalogue deliberately falls back when a layout needs unavailable artwork. Some image placement is still conservative.
- The planner sees website images, but the automatic reviewer does not inspect the finished exported pixels. Browser file/fit checks and this manual visual review are separate. A future draft or long revision can still need editing before downloads pass.
- Public extraction is best effort, with image count/size limits and English output. Three successful brands do not prove every readable site, conflicting offer or interrupted session. No marketing results or founder acceptance have been measured.
- Model latency and plan limits remain. Cached drafts and clear errors improve recovery; they do not guarantee an instant response. PDFs embed the PNG artwork, so their text is not selectable.

Next: judge the three final sheets against the saved originals, then test one new business outside these categories.
