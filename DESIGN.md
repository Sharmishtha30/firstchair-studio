# FirstChair Studio — design

Current visual direction, 6 October 2026. This supersedes earlier FirstChair violet/yellow and chair-logo directions in design/firstchair-brand.md. Exported customer creatives follow their own source brand, not FirstChair's interface palette.

## Identity

Product name: FirstChair Studio. Use the supplied script wordmark. On the landing only, display its full FirstChair lettering with a separate light, letter-spaced STUDIO centred beneath it. Preserve the original combined logo on later screens. The browser icon is a pink #FF307E FC monogram.

Primary action: bold pink #FF307E. Interface ink: deep indigo #201047, with white #FFFFFF over the sky where appropriate. Violet #5424FF and yellow #FFE34D are retired as the primary interface direction. Keep colour emphasis on the action rather than adding competing accents.

## Landing

One viewport, no page scroll at the previously checked desktop/mobile sizes. Small FirstChair wordmark at top left; Sample preview at top right, plus the local ChatGPT connection control where supported. Centre the short headline and one website action.

Current copy:
- Your website in. Editable carousels and posts out.
- Take your brand to the front row. On-brand posts you can change in a click.
- Input placeholder: Add your website here, faded until entered.
- Action: Create my posts.
- Small link below the input: See examples, opening the existing Sample preview.

Keep the initial field empty. No Founder's Find example prefill, platform picker, long explanation or Instagram/LinkedIn badges on the landing. Founder's Find can appear as one properly labelled gallery example.

## Sky and motion

Use the three user-supplied golden/orange/pink sky photographs already stored in the project. Keep the sky fixed behind landing, onboarding, generation and results. The current 48-second overlapping fades retain an opaque base sky so there is no blank/dark gap. Motion should be slow and continuous, not visibly swap backgrounds at a step boundary. Respect reduced motion by freezing the sky and disabling question transitions.

User interaction drives short question transitions. Preserve focus, readable contrast and stable placement. Use smooth contemporary interaction inspired by Relay and Framer; do not copy Relay's brand or add a long questionnaire.

## Onboarding and waiting

After the website field, require Article or Call transcript. The website supplies only colours and fonts. The selected content supplies the script. No skip, goal or offer-focus questionnaire. Preserve typed content when switching tabs. Show actual progress and useful errors; never hide failure behind a spinner.

## Sample collection

Separate scrolling page, intentionally quiet so the exported work carries the colour. Background #F8F7F5; ink #201A2C; subdued text #746B7B; fine borders #DEDBE1. A simple header has FirstChair and Back to studio. Intro is short.

For each website: name and clickable domain, then a two-column static/carousel pair. Static on left; carousel on right. Show slide count and bounded previous/next controls; preserve each creative's full 4:5 image without cropping. Maintain this order on narrow screens with appropriately reduced spacing. Use lightweight compressed images and lazy loading. Label saved test outputs honestly, including reviewed/edited examples. No duplicative platform tabs, ratings, invented success metrics or extra marketing paragraphs.

## Result workspace

Keep FirstChair identity and sky continuity. Use two columns: Carousel / Statics tabs and one rendered creative on the left; only image-text editing on the right. Preview edits immediately. Keep slide navigation below the carousel. Hide brand metadata, captions, downloads, rewrite controls and edit-count messaging from this preview. Use a compact saved-draft recovery notice. Stack the editor below the creative on narrow screens. Billing remains separate and unimplemented.

## Customer creative principles

Website supplies colours and heading/body fonts only. Do not import website claims, audience, logos or imagery into new creatives. Source-only content follows `CONTENT_PROCESS.md`. Apply the fixed format below; the static shares the carousel's central message. Record font fallbacks honestly. Check actual previews and exports for readable type, spacing, contrast and overflow.

## Accessibility and acceptance

Keyboard-accessible controls, visible focus, descriptive image labels, disabled carousel bounds, readable contrast and reduced-motion support are required. Check narrow screens and desktop in the browser. Do not claim the entire journey was tested after checking only a landing or a sample.

Open design issue: exact Relay-style FirstChair lettering remains unresolved. Recommendation work must preserve the current interface unless explicitly requested otherwise.


## Latest landing update — 2026-10-07
Remove the sample static beside the website field and its label. Use a pink globe website icon instead of the diagonal arrow in the field. Remove both “A carousel and a static post for Instagram” and “Carousels + statics. Made for your brand.” Keep the headline, sky, colours and empty website placeholder. The website form is centred at up to 820px wide with 28px space above it. The Sample preview collection remains available in the header. This update was checked in the local browser and passed npm run check; it has not been deployed.

## Type

Landing interface only: Plus Jakarta Sans, a free Google Font, self-hosted with its SIL Open Font License in public/fonts. Later screens keep their existing typography. Script lettering stays in the supplied logo image.

- Headline: bold 700, fluid 36–64px (64px at 1440px desktop; 36px at 390px phone), line height 1.08.
- Subline: semi-bold 600, 24px desktop and 18px phone, line height 1.45.
- Button: existing 15px desktop and 12px phone, bold 700; existing pink and input treatment retained.
- Small link: semi-bold 600, 13px desktop and 12px phone. STUDIO: light 300, 10px desktop and 9px phone, letter spacing .28em.
- Short screens under 740px high: headline 28–44px and subline 18px. Under 580px high: headline 26px and subline 15px.

The input/button row itself is centred at 50% of viewport width and height; headline and subline sit above, examples below. A soft dark indigo gradient supports centre text contrast without modifying sky photos or motion. One viewport without scrolling.


## Frozen final creative format — 13 October 2026

User-approved reference: `reference/frozen-output-format.png`. This supersedes earlier variable-layout instructions for newly rendered final carousel and static output. Fixed 1080 × 1350 portrait canvas, small uppercase topic label at top left, accent-colour opening quote mark, generous space, large left-aligned copy in the middle, and a bottom row containing the website hostname and carousel slide count. No top logo, ruled notebook lines, photos, diagrams or automatic alternate compositions. Content and observed website branding (fonts and paper/ink/accent colours) vary; the composition stays fixed. Do not add source-origin captions such as “From an article”. Use a short brand-colour rule on every slide and brand-colour headings when contrast permits; retain readable ink for light brand colours. Keep the former brand-footer space empty in new source-only packs; do not invent a publisher identity. Decorative quotation marks do not turn rewritten content into a verbatim testimonial. Preview and downloads share this renderer. Existing gallery image files are historical saved examples. Do not change this format without the user's explicit request.


## Source choice — 13 October 2026
After entering the brand website, choose Call transcript or Article. Paste text or upload a supported text/document file. Articles are separate content evidence, never customer transcripts or replacement brand identity. The website supplies only colours and fonts. Both use the frozen final format; neither output adds an automatic source-origin caption. Blocked website styling preserves the content and offers retry. Do not substitute business text or claim styling was extracted when blocked.
