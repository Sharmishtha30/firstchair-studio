# FirstChair Studio — design

Current visual direction, 6 October 2026. This supersedes earlier FirstChair violet/yellow and chair-logo directions in design/firstchair-brand.md. Exported customer creatives follow their own source brand, not FirstChair's interface palette.

## Identity

Product name: FirstChair Studio. Visible header wordmark: FirstChair, small and restrained. Current implementation uses a clear sans-serif wordmark. The user supplied Relay's handwritten logo as an exact lettering reference, but the actual font has not been identified; do not claim an exact match or substitute an unrelated script as complete.

Primary action: bold pink #FF307E. Interface ink: deep indigo #201047, with white #FFFFFF over the sky where appropriate. Violet #5424FF and yellow #FFE34D are retired as the primary interface direction. Keep colour emphasis on the action rather than adding competing accents.

## Landing

One viewport, no page scroll at the previously checked desktop/mobile sizes. Small FirstChair wordmark at top left; Sample preview at top right, plus the local ChatGPT connection control where supported. Centre the short headline and one website action.

Current copy:
- Take your brand / to the front row.
- Your website, turned into visual posts worth sharing.
- Input placeholder: Add your website here, faded until entered.
- Action: Create my posts.
- Footer: Carousels + statics. Made for your brand.

Keep the initial field empty. No Founder's Find example prefill, platform picker, long explanation or Instagram/LinkedIn badges on the landing. Founder's Find can appear as one properly labelled gallery example.

## Sky and motion

Use the three user-supplied golden/orange/pink sky photographs already stored in the project. Keep the sky fixed behind landing, onboarding, generation and results. The current 48-second overlapping fades retain an opaque base sky so there is no blank/dark gap. Motion should be slow and continuous, not visibly swap backgrounds at a step boundary. Respect reduced motion by freezing the sky and disabling question transitions.

User interaction drives short question transitions. Preserve focus, readable contrast and stable placement. Use smooth contemporary interaction inspired by Relay and Framer; do not copy Relay's brand or add a long questionnaire.

## Onboarding and waiting

Two questions only: goal then optional offer focus. Goal choices advance directly; focus can be left blank for Choose for me. Use generous choice targets, brief transitions and minimal text. Reading happens in parallel; show actual progress after questions. Do not obscure failure behind a permanent spinner. Availability messages stay in the same visual world and offer a usable next action.

## Sample collection

Separate scrolling page, intentionally quiet so the exported work carries the colour. Background #F8F7F5; ink #201A2C; subdued text #746B7B; fine borders #DEDBE1. A simple header has FirstChair and Back to studio. Intro is short.

For each website: name and clickable domain, then a two-column static/carousel pair. Static on left; carousel on right. Show slide count and bounded previous/next controls; preserve each creative's full 4:5 image without cropping. Maintain this order on narrow screens with appropriately reduced spacing. Use lightweight compressed images and lazy loading. Label saved test outputs honestly, including reviewed/edited examples. No duplicative platform tabs, ratings, invented success metrics or extra marketing paragraphs.

## Result workspace

Keep FirstChair identity and sky continuity. Use two columns: Carousel / Statics tabs and one rendered creative on the left; only image-text editing on the right. Preview edits immediately. Keep slide navigation below the carousel. Hide brand metadata, captions, downloads, rewrite controls and edit-count messaging from this preview. Use a compact saved-draft recovery notice. Stack the editor below the creative on narrow screens. Billing remains separate and unimplemented.

## Customer creative principles

Each website supplies its own palette, heading/body character, logos and product/editorial imagery. Preserve semantic colour roles, image proportions, available fonts and actual product identity. Label fallback typography and missing evidence. Never apply FirstChair pink or its sky to all customer exports.

One carousel communicates a coherent opening, explanation and payoff with varied visual pace. The static delivers a different complete idea. Use authentic source photography, typography and useful original diagrams. Reject generic slogans, invented testimonials or data, AI faces, fake product screenshots and paragraph-heavy cards. Match copy and image to the named offer.

Current renderer floors include readable headings/body text, supported declarative layouts and copy-density checks. These checks do not guarantee quality. Inspect every exported image for clipping, distortion, brand accuracy and supported claims; inspect actual PDF pages when claiming PDF visual verification.

## Accessibility and acceptance

Keyboard-accessible controls, visible focus, descriptive image labels, disabled carousel bounds, readable contrast and reduced-motion support are required. Check narrow screens and desktop in the browser. Do not claim the entire journey was tested after checking only a landing or a sample.

Open design issue: exact Relay-style FirstChair lettering remains unresolved. Recommendation work must preserve the current interface unless explicitly requested otherwise.


## Latest landing update — 2026-10-07
Remove the sample static beside the website field and its label. Use a pink globe website icon instead of the diagonal arrow in the field. Remove both “A carousel and a static post for Instagram” and “Carousels + statics. Made for your brand.” Keep the headline, sky, colours and empty website placeholder. The website form is centred at up to 820px wide with 28px space above it. The Sample preview collection remains available in the header. This update was checked in the local browser and passed npm run check; it has not been deployed.
