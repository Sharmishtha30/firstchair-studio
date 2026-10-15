# Local verification — 13 October 2026
No production deployment or Git push was performed for this request.

## Layout
Chromium at 390×900 and 1440×900, using real anonymous local sessions. Same existing sky animation frame paused only in the test browser for screenshot comparison; application background unchanged.

- 390px: usable input width increased from 128px to 296px. The placeholder needs 168px at the retained 16px input size and fits completely.
- 1440px: input width unchanged at 580px (552px usable).
- Examples target increased from 35px (phone) / 36px (desktop) to 44px.
- No horizontal scrolling at either size. Header label stays inside the viewport and on one text line. On phones header controls occupy a row below the logo.
- Focused input accepts and retains a long address. Primary button stays within the 900px-high viewport and opens the content-input step. See examples opens the gallery at both sizes.
- Before/after and focused screenshots are saved in this directory.
- Real mobile keyboard behavior was not tested on a physical phone.

## Writing
- Static generation constrained to 8 heading words + 17 body words; no post-generation truncation.
- Review failures require a location, concrete problem and correction. Reviewer receives public copy and full source, not internal planning IDs. Optional interior headings are explicitly permitted.
- Formatting and semantic review each have one bounded repair. Invalid optional highlights are omitted without changing copy or removing the brand-colour rule.
- Fresh local article completed in approximately 62 seconds and its ZIP passed integrity checks; all four unique rendered images were inspected.
- Local transcript did not complete reliably: final retry failed the 40-word carousel budget. No claim that both generation paths are release-ready. Article completion also does not prove general factual reliability; broader human content review remains necessary.
