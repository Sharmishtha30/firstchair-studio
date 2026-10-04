# Static-ad board: observed patterns

Source: the founder's supplied `Creatives Board - public view.png`, saved unchanged in `assets/static-ads-board.png`. It is 1920 × 1080 and titled “98 STATIC ADS”. This is an overview image: individual ads are only roughly 40–55 pixels wide. The title's count is not an independently verified inventory. Individual small copy and claims are not reliably readable.

## Reusable compositions visible in the overview

1. **Headline first:** one dominant hook, a quieter value explanation and a small action. Founder’s Find adaptation: Georgia hook with pink italic emphasis, Inter body, white space.
2. **Split comparison:** two contrasting blocks or sides make a difference immediately visible. Adaptation: execution versus judgement, using the actual website's distinction. No guaranteed promotion or invented before/after results.
3. **Highlighted text / note:** compact text sits inside a simple contrasting field. Adaptation: a framed value statement, with the action separated clearly. No fake customer quotes, chat messages or testimonials.
4. **Object or mechanism first:** one central visual anchors the headline. Adaptation: actual-brand geometric diagrams rather than fabricated products or AI faces.

These are observed composition patterns, not copied ads and not performance-tested winners. The board does not establish Founder’s Find's colours, font or claims; its website remains that authority.

## Application

`src/staticAds.ts` implements headline, comparison and note variants for the approved static-post copy. The main app's Founder’s Find static post uses the comparison composition; carousel and reel retain the website-led typographic diagram style. All three static variants are available as reviewed local examples in `verification/static-ad-variants/`.
