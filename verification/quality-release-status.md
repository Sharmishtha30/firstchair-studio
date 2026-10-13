# Shared quality gate — 13 October 2026

- `npm run test:quality`: passed; type checks, 179 unit tests, 24 Chromium rendering cases (six structures × four palettes).
- Saved gallery: all 47 images across 10 examples decoded. Historical raster files were not regenerated and are not evidence of source-grounded writing.
- `npm run build`: passed, with existing bundle-size and dependency directive warnings.
- Fresh article: completed in 100.534 seconds, five model requests including correction/review. Primary #0a192f is in matched website colour evidence. Six carousel slides plus a static rendered and exported at 1080 × 1350.
- Fresh transcript: completed in 48.340 seconds, four model requests. Primary #ff307e is in matched website colour evidence. Four carousel slides plus a static rendered and exported at 1080 × 1350.
- Actual article/transcript browser-rendered contact sheets visually inspected: footer hostname, list indentation, numbering, highlights and visible colour rule; no observed clipping.
- Colour extraction is matched HTML/CSS evidence, not browser-computed website styling or a formal brand guide. Missing evidence blocks new generation. It must not be reported as exact brand verification.
- Authenticated editor tested in isolated Chromium using a separate anonymous local test account and a copy of the article result. The real Save changes button persisted the edited heading to Convex and it survived reload. The real Download PNG and Download ZIP buttons produced valid files; ZIP contained all seven images. Exported PNG visually inspected. Original user result and allowance unchanged.
- This test caught an old 32-word/image requirement in manual saves. Generation and source-only editing now share the 40-word carousel / 25-word static rule through contentFormatting.ts. Added a regression test. ChatGPT login itself was not retested in this editor test.
- No Git push or deployment. User trial and remaining release checks precede publication.

No pack tokens, credentials or private transcript text are included in this report.

## Production OpenAI test — 2026-10-13
- Production visitor sessions create successfully and persist on refresh.
- OpenAI API credentials are accepted; no credentials are recorded here.
- Two real-browser article submissions failed exact source-evidence validation at approximately 105 and 130 seconds.
- Added one bounded quotation-repair attempt, preserving strict validation. The second run still failed, so this is not a verified generation fix.
- Type checks and all 179 tests pass; they do not establish production generation success.
- Production is not yet ready for external generation testers. Next: replace model-copied quotation strings with source-indexed evidence references and verify article and transcript output end to end.

## Indexed source evidence — 2026-10-13
- Implemented source-only-v2: stable numbered exact source slices; planning and formatting select integer IDs bounded to the available passages.
- Semantic review receives publishable copy once per format, excluding private evidence snippets and duplicate platform copies. It still checks against the full source.
- Type checks and 182 tests pass; deployment completed.
- Live article and transcript retries progressed beyond the quotation-reference failure. Neither final generation passed: article review returned a failed quality flag without actionable issues; transcript correction again exceeded the 25-word static limit.
- Stopped repeated API retries. Do not treat a rendered draft or downloadable ZIP as successful final generation.
- Release remains unsuitable for external generation testing. Next work: require actionable reviewer reasons and constrain static composition before the full draft, with bounded targeted correction and fresh acceptance tests.
