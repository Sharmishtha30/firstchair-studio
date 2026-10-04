# Asset provenance

- `public/images/founders-editorial.png`: original image created with the built-in image generation tool on 4 October 2026. Two fictional Indian professionals; no actual customer, founder or testimonial is depicted. Prompt follows the editorial photography direction in `style-anchor.md`. The source remains in `/Users/sam/.codex/generated_images/01a0ffbf-2d89-7173-bbd5-4aff8ed85b0b/exec-e5b75acb-aa5f-4b7a-aca5-c57eb145c5a9.png`.
- `career-decision.webp` and `fictional-presenter.webp`: left/right crops of that original diptych. The portrait is an AI-created image, not a talking or lip-synced avatar video.
- Inter weights 400, 500 and 600: the Latin font files served by the public Founders Find stylesheet `https://foundersfind.club/_next/static/css/27d4951ab6f95aab.css`. The Inter license is included in `public/fonts/OFL.txt`, from the official Inter repository. Exported Founders Find artwork uses these fonts; the studio has its own interface styling.
- Founders Find artwork palette: primary #ff307e, ink #0f0f12, paper #ffffff, accent #f5c518, read from the default `:root` variables in `https://foundersfind.club/_next/static/css/3f4f0004ed56e25f.css`. These are observed site colors, not a formal brand guide.
- Motion reel music: an original quiet synthesised instrumental bed, generated in the browser and encoded as AAC inside the MP4. No copyrighted recording is sampled.
- No ads have been imported. Meta's public library returned HTTP 403. The official adapter requires approved API access; no “winning ad” or performance claim is made.

## Website-specific image adapter

Seedream image requests use the public offer and inferred audience tension as creative context, never as testimony. Editorial photography uses natural light and matte everyday materials; observed site colours appear as restrained accents. The scene should follow the offer's environment, not default every brand to an office. The presenter is fictional, with face in the upper half so the lower text panel remains clear. Logos, exact product replicas, customer stories, UI and text are excluded. Source: https://docs.byteplus.com/en/docs/modelark/seedream-4-0-5-0 .

No live Seedream output has been generated or visually approved: ARK_API_KEY is missing. Shared original imagery remains labelled sample artwork. Convex stores original provider JPEG or PNG files, exposes storage URLs on reads, and the renderer uses those URLs for previews and actual exports. The temporary storage/browser fixture was deleted after verification and is not saved in any customer's pack.
