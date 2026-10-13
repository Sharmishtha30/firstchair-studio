# AI Reel Editor — research and build specification

Research date: 8 October 2026. Proposed separate reel journey for FirstChair; this document does not replace its existing carousel/static product scope. Deliverable: a founder uploads one 30–90-second talking-head recording and downloads an edited vertical reel.

## Product and research boundaries

Serve small Indian brand founders who want their own voice and product knowledge to look presentable without learning a video editor. Start with one speaker, English, Hindi and Hinglish. Preserve what they actually said, including prices, product names and negations. Let them correct recognition errors before export. Hindi/English switching and Roman Hindi need testing; do not promise perfect recognition.

The competitor findings below come from official product pages, help pages and licence terms, not hands-on testing. Features can vary by plan, device and region. “Not verified” means the cited documentation did not establish that particular automation; it does not prove the feature is absent. Implementations and thresholds below are our proposed choices, not disclosures of competitors’ internal algorithms.

## Cost assumptions

Costs are **our incremental processing costs**, not competitors’ subscription prices or a proposed selling price. Assume one 60-second source recording, one transcription and one export on an existing Mac. Budget **$0.006 for Whisper transcription**, approximately **₹0.54 using a planning conversion of ₹90/$**, not a live exchange rate. Word timings are available through `whisper-1` with `verbose_json` and `timestamp_granularities: ["word"]`; do not substitute a different transcription model without checking its timestamp support. [OpenAI transcription guide](https://developers.openai.com/api/docs/guides/speech-to-text), [Whisper model pricing](https://developers.openai.com/api/docs/models/whisper-1).

Local processing has no per-render vendor bill, but consumes hardware time and electricity. Estimates exclude development, taxes, Convex usage, storage, bandwidth and any music or software licence. Shared transcription is charged once, not once per feature. An optional text-model hook generator gets a **$0.001–$0.005 planning allowance**, to be measured against the selected model’s actual token usage; that is not a quoted API rate. [Current API pricing](https://developers.openai.com/api/docs/pricing).

## 1. Word-by-word captions burned into the video

**Competitors:** Submagic generates timed captions with animated styles. CapCut generates editable auto captions. Captions provides styled subtitles and word correction. Edits supports caption editing, including bulk edits. These sources establish caption tools; they do not establish identical word-highlighting behaviour in every editor. [Submagic](https://www.submagic.co/features/auto-video-editor), [CapCut captions](https://www.capcut.com/help/auto-captions-in-capcut), [Captions text controls](https://help.captions.ai/docs/visual/text), [Edits caption updates](https://about.fb.com/news/2025/11/instagram-empowers-creators-to-go-global-with-local-voice-translations-and-fonts/).

**Build:** Extract audio locally with FFmpeg, transcribe with Whisper word timestamps, and render captions through a shared Remotion React composition. Remotion turns React layouts into video frames. Display a stable 3–5-word phrase and highlight the active word rather than moving the whole line on every syllable. Keep two lines maximum, explicit spaces between differently styled words, and a readable outline. Load fonts before preview or export. Use output-time word positions after cuts, not original recording times. [Remotion Player](https://www.remotion.dev/docs/player), [renderMedia](https://www.remotion.dev/docs/renderer/render-media).

**Editable:** Every word, phrase breaks, individual timing, position, size, highlight colour and caption visibility. Corrected text keeps its original timing unless explicitly changed. Preview and exported video use the same composition.

**60-second cost:** $0.006 / about ₹0.54 for the shared transcription; local caption rendering adds no API charge. Text corrections do not require transcription again.

## 2. Automatic zoom on key moments

**Competitors:** Submagic documents automatic MagicZoom placement and manual adjustments. Captions’ AI Edit includes zooms through editing styles. CapCut documents keyframe zoom control; automatic meaning-based placement was not established. Edits’ precise timeline is documented, but automatic key-moment zoom was not verified. [Submagic](https://www.submagic.co/features/auto-video-editor), [Captions AI Edit](https://captions.ai/help/docs/project/ai-edit), [CapCut keyframes](https://www.capcut.com/resource/how-to-zoom-in-on-video), [Edits launch](https://about.fb.com/ltam/news/2025/04/presentamos-edits-una-aplicacion-para-la-creacion-de-videos/).

**Build:** Use transcript sentence boundaries and audio emphasis to suggest two or three moments. This is a simple heuristic, not a reliable understanding of importance. Animate scale from 1.0 to around 1.1–1.15 with a gentle return. Give the founder a crop anchor so faces remain visible. Disable suggestions for already tightly cropped footage. Render the transform in Remotion. Defer a separate semantic planning model until this adds measurable value.

**Editable:** Enable/disable each zoom, start/end, amount, crop centre and smoothness.

**60-second cost:** $0 additional API cost using existing timings and local analysis. A later model-assisted planner needs its own measured budget; do not hide it inside transcription pricing.

## 3. Background music that ducks under speech

**Competitors:** Submagic supports background music; CapCut supports audio tracks; Captions advertises AI music and music in AI Edit. Edits provides audio editing tools, but the reviewed pages did not establish automatic speech ducking. Do not assume any of these sources proves a specific ducking algorithm. [Submagic](https://www.submagic.co/features/auto-video-editor), [CapCut editing overview](https://www.capcut.com/resource/ai-editing-the-capcut-way), [Captions](https://captions.ai/), [Edits](https://about.fb.com/news/2026/04/one-year-of-edits-built-for-and-with-creators/).

**Build:** Import a licensed instrumental track. FFmpeg `sidechaincompress` uses speech to lower the music; `amix` combines them. Mix **after** speech cuts. Start conservatively, with music roughly 18–24 dB below speech, then listen and tune attack/release so it does not pump between words. Loop with a short crossfade, fade at the reel boundaries, and prevent clipping. These levels are starting settings, not Instagram requirements. [FFmpeg audio filters](https://ffmpeg.org/ffmpeg-filters.html).

**Editable:** Track, music on/off, volume, duck strength and starting point. Provide an attribution credit when the licence requires one.

**60-second cost:** $0 additional API cost; licence cost is separate. A track already properly licensed for this use can have zero incremental cost. Illustratively, a $20 licence allocation across 100 permitted reels is $0.20 each; this is arithmetic, not a provider quote or permission to reuse a track.

## 4. Cutting silence and filler words

**Competitors:** Submagic documents SmartTrim for pauses and fillers. CapCut’s transcript workflow and Captions’ editor document filler/pause removal. Equivalent automatic silence/filler removal in Edits was not verified. [Submagic](https://www.submagic.co/features/auto-video-editor), [CapCut](https://www.capcut.com/resource/ai-editing-the-capcut-way), [Captions editor](https://captions.ai/tools/ai-video-editor).

**Build:** Detect candidate pauses locally. Start with pauses longer than 0.65 seconds and retain about 150 ms around speech; tune thresholds for quiet speech and phone noise. Maintain one edit decision list: source intervals retained in the output. Use that same list to cut video and audio and remap captions. Never remove silence from audio alone: that would break lip sync.

Suggest fillers from word timings, but require approval. Hindi words such as “तो” and “मतलब” can carry meaning; do not delete them globally. Protect negations, hesitation that changes meaning, and mid-word audio. Add short audio fades at joins without changing overall timing.

**Editable:** Review each suggested deletion, restore it, adjust its boundaries, and choose gentle or tighter pacing. Keep the original recording untouched.

**60-second cost:** $0 additional API cost with shared transcription and local detection. Retranscribing the whole input would add another $0.006 and should normally be unnecessary.

## 5. Trimming start and end

**Competitors:** All four offer clip/timeline editing. CapCut and Edits expose timeline controls; Captions permits trimming; Submagic includes trimming in its editor. [CapCut](https://www.capcut.com/resource/ai-editing-the-capcut-way), [Edits launch](https://about.fb.com/ltam/news/2025/04/presentamos-edits-una-aplicacion-para-la-creacion-de-videos/), [Captions](https://captions.ai/tools/ai-video-editor), [Submagic](https://www.submagic.co/features/auto-video-editor).

**Build:** Suggest removing leading/trailing silence, with handles for manual adjustment. Apply boundaries through the same edit list used for internal cuts. FFmpeg trim/concat and timestamp reset perform the media preparation. Preserve the first and last complete word.

**Editable:** Start/end handles, play selection, restore original boundaries.

**60-second cost:** $0 additional API cost, local processing only.

## 6. Vertical 1080 × 1920 export

**Competitors:** Submagic offers aspect-ratio and resolution choices. CapCut documents 1080p export. Captions exports edited videos. Edits documents exports without added watermarks, but the exact 1080 × 1920 preset was not established by the reviewed Meta pages. [Submagic](https://www.submagic.co/features/auto-video-editor), [CapCut export](https://www.capcut.com/resource/add-subtitles-to-video), [Captions editor](https://captions.ai/tools/ai-video-editor), [Edits launch](https://about.fb.com/ltam/news/2025/04/presentamos-edits-una-aplicacion-para-la-creacion-de-videos/).

**Build:** Use ffprobe to inspect dimensions, rotation, duration and audio. Normalise phone orientation and variable frame rate. Render H.264 MP4, 1080 × 1920, 30 fps, `yuv420p`, AAC audio and fast-start playback. Start around 8 Mbps video; a 60-second output is roughly 61 MB including audio. Offer crop or fit-with-background for landscape input. Low-resolution sources should show a quality warning, not an invented improvement. [ffprobe](https://ffmpeg.org/ffprobe.html), [FFmpeg filters](https://ffmpeg.org/ffmpeg-filters.html).

**Editable:** Crop position and fit/crop choice; V1 keeps the export preset fixed.

**60-second cost:** $0 per-export API charge locally. Rendering time must be benchmarked on the actual Mac; do not promise an unmeasured turnaround.

## 7. A hook in the first three seconds

**Competitors:** Their text/caption tools can support opening text, but the reviewed documentation did not consistently establish an automatic, fact-grounded, three-second hook across all four. Treat the ability to place text separately from automatic hook writing. [CapCut subtitle styling](https://www.capcut.com/help/how-to-import-subtitles), [Captions text](https://help.captions.ai/docs/visual/text), [Submagic editor](https://www.submagic.co/features/auto-video-editor), [Edits updates](https://about.fb.com/news/2025/11/instagram-empowers-creators-to-go-global-with-local-voice-translations-and-fonts/).

**Build:** V1 suggests a short opening line extracted from the transcript and allows manual replacement. Overlay it from output second 0 to 3, leaving subtitles readable below. Do not invent savings, results or product claims. Later, ask a text model for two suggestions with the supporting transcript span attached. Do not reorder spoken footage or generate a new voice in V1.

**Editable:** Wording, placement, duration and off switch. The founder approves before export.

**60-second cost:** $0 additional API cost for extractive/manual hooks; optional model suggestions have the $0.001–$0.005 allowance described above.

## 8. Brand font and colours

**Competitors:** Submagic documents custom fonts/brand styling. CapCut supports font, colour and placement adjustments. Captions provides font/style controls. Edits has added Indian-script fonts; arbitrary uploaded brand-font support was not verified for Edits or Captions. [Submagic](https://www.submagic.co/features/auto-video-editor), [CapCut styling](https://www.capcut.com/help/how-to-import-subtitles), [Captions text](https://help.captions.ai/docs/visual/text), [Edits Indian fonts](https://about.fb.com/news/2025/11/instagram-empowers-creators-to-go-global-with-local-voice-translations-and-fonts/).

**Build:** Save a small brand preset: licensed font upload, text colour, highlight colour and outline/background. Load the same font into browser preview and renderer. Check Hindi glyph support; offer Noto Sans Devanagari when missing, with an explicit notice. Do not silently replace fonts. Store a reusable preset in Convex.

**Editable:** Font, colours, size, outline and reset to readable defaults. Require permission to use uploaded fonts commercially.

**60-second cost:** $0 additional API cost. Font licence cost, if any, is separate.

## Recommended V1: the smallest credible paid product

Payment willingness is a hypothesis to test with founders, not something competitor feature lists prove. Sell the outcome: **my recording, with corrected branded captions and clean pacing, ready to post**.

| Include first | Keep out of the first release |
|---|---|
| One 30–90-second recording; English/Hindi/Hinglish transcription | Multiple speakers, dubbing, voice replacement |
| Editable timed captions and one reusable brand preset | Large animation/template marketplace |
| Start/end trim and reviewable silence cuts | Automatic filler deletion without review |
| Editable opening hook | Invented hooks or rearranged speech |
| Optional user-imported licensed music with ducking | Bundled stock library without platform rights |
| Preview, undo and one reliable 1080 × 1920 download | Publishing integrations, billing implementation |
| Clear progress and recoverable failures | Automatic semantic zoom and generated B-roll |

Zoom is specified above for a later version; it is not necessary to prove the first paid outcome. Music is optional: a founder must be able to finish without it.

**Baseline processing budget:** $0.006 / approximately ₹0.54 per 60-second input. With optional model hook suggestions: $0.007–$0.011 / about ₹0.63–₹0.99. Add actual licences and infrastructure separately. Two full transcriptions double the transcription component. Re-exporting corrected text should not call transcription again.

## Local Mac architecture: React + Convex

Use React for upload, transcript correction and preview; Convex for project metadata, editing state and job status; a **local Node worker** for FFmpeg and Remotion rendering. A worker is a process running on the Mac that handles the video job. Convex actions are not a place to spawn local FFmpeg processes. [Convex actions](https://docs.convex.dev/functions/actions).

For the local prototype, keep recordings, audio, fonts and exports on the Mac. Store opaque file IDs and metadata in Convex, not public filesystem paths. Serve media through the local server with ownership checks; avoid `file://` URLs. API credentials stay on the server, never in React. OpenAI API usage requires API billing; a ChatGPT subscription is not the processing budget.

### Processing sequence

1. Validate file, one-speaker assumption and 30–90-second duration. Initially allow MP4/MOV up to 250 MB; handle iPhone HEVC and rotation. Create a small preview copy.
2. Extract transcription audio under the API file limit. Keep the original-quality speech track for export.
3. Transcribe once; retain immutable source word timings. Show an editable transcript as soon as available.
4. Suggest boundary trims and silence cuts. The founder reviews while the preview is prepared.
5. Save retained intervals as `{sourceStart, sourceEnd, outputStart}`. Remap retained words to output time; reject cuts through words. Hook timing starts at output zero.
6. Prepare the shortened video/audio and optional music mix. Use one common timeline for all tracks.
7. Preview the Remotion composition, including captions, hook and crop. Save edits without retranscribing.
8. Render the exact composition to MP4; verify dimensions, duration and playable audio before offering download.

Use one render job at a time initially. Store job phase, start/end time, error, retry count and editor version. Suggested records: projects, transcript words, brand presets, editing versions and render jobs. A claimed job needs a heartbeat and expiry so a stopped worker can recover. Retries resume the failed step; they must not charge transcription again when its result exists. Never overwrite an export made from a newer editor version.

Show honest stages: Checking video → Transcribing → Preparing preview → Ready to edit → Exporting. Record elapsed time for each phase and total time. Show percentage only when real rendering progress is available. No endless spinner or fabricated countdown. Benchmark cold and repeat runs separately.

Remotion has commercial licence conditions: its current licence permits some small-company/individual commercial usage but requires licensing beyond its stated limits. Check the pinned version and business eligibility before charging customers. Local rendering does not mean every software licence is automatically free. [Remotion licence](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).

## Music sources and commercial permission

“Royalty-free” describes licence terms; it does not mean public domain, unrestricted redistribution or guaranteed absence of copyright claims.

| Source | Commercial reel use | What to check before using it |
|---|---|---|
| [Mixkit Music Free License](https://mixkit.co/license/modal/musicFree/) | Allows commercial social videos and online ads under its terms | No standalone music distribution. Its [terms](https://mixkit.co/terms/) restrict redistributing an asset inventory; do not assume a reusable in-app library is allowed. |
| [Pixabay licence](https://pixabay.com/service/license-summary/) | Offers usable assets under its content licence, subject to restrictions | No standalone redistribution; check track rights and any third-party restrictions. Save the licence evidence. A public download does not establish platform sublicensing. |
| [Incompetech licences](https://incompetech.com/music/royalty-free/licenses/) | Tracks under an appropriate Creative Commons licence can permit commercial use with required credit; paid licensing is available | Check the individual track’s licence, attribution and modification requirements. Do not use a noncommercial licence for brand marketing. |
| [Bensound terms](https://www.bensound.com/terms-and-conditions) | Paid licences distinguish ordinary video, advertising and multiple-client use | Business rights and SaaS/platform integration are different: its terms explicitly provide custom licensing for platform integration. Free tracks have specific credit and single-video conditions. |
| [Meta Sound Collection guidance](https://www.facebook.com/help/instagram/402084904469945) | Meta directs business users toward commercially usable Sound Collection music | Check scope for Facebook/Instagram and the individual terms; do not assume cross-platform redistribution or an in-app library grant. |
| [YouTube Audio Library](https://support.google.com/youtube/answer/3376882?hl=en) | Some tracks have explicit Creative Commons terms | YouTube’s guidance does not blanket-clear every track for Instagram. Use only a track whose licence actually permits the intended use. |

Do not take ordinary CapCut music and assume it is cleared for commercial Instagram reels: its Commercial Sounds permission is platform-limited. [CapCut materials licence](https://www.capcut.com/clause/material-license-agreement?enter_from=page_header&from_page=landing_page&lang=en&scenario=custom).

**V1 choice:** user imports a track they have licensed for this reel, or exports without music. Before offering built-in tracks, obtain written permission covering commercial client reels, synchronisation with video, app access and the required redistribution/sublicensing scope. Commissioned tracks with explicit rights are another option. Keep track title, creator, source URL, licence version/date, receipt where applicable, and required attribution with the project. Licence records help resolve claims; they do not guarantee a platform will never flag audio.

## Acceptance checks and build order

First build upload → transcription → editable branded captions → exported video. Then add trim/silence review, hook and optional music. Finally test the full journey with actual founders before deciding payment packaging.

Use at least ten consented recordings spanning Hindi, English, Hinglish, brand names, numbers, quiet speech, fan noise and iPhone orientation. Check:

- All exports are 1080 × 1920, play on a phone, and retain lip sync after cuts.
- Spot-check word highlighting before and after every cut; target timing within 150 ms on the checked words, and allow manual correction. This is a test target, not an accuracy claim.
- No missing negations, joined caption words, unsupported Hindi glyphs, clipped words or hidden faces.
- Preview matches export; text edits and a second export do not trigger a new transcription charge.
- Music remains audible but speech is intelligible; mute music and confirm the reel still works.
- Restoring a deletion restores video, audio and captions together.
- A stopped worker, transcription failure or interrupted export has a useful retry path.
- Measure time to preview, time spent correcting, export time and actual API cost. Set a turnaround promise only after measuring the Mac and representative recordings.

Do not claim the product is ready because a sample render worked. The first release is ready when a founder can correct and export their own recording without help, and the result is accurate enough for them to publish.

## First working slice — 8 October 2026

Available locally at **http://localhost:5173/reels**. This is a separate page from the website-to-carousel editor.

Implemented: 30–90-second video upload; local multilingual speech recognition; editable word text/timings; brand font upload and colours; optional opening text; start/end trim; fit/crop framing; saved edits in local Convex; burned captions in a 1080 × 1920 H.264/AAC MP4; browser download. After export the preview plays the actual rendered file. Before export it is a draft layout: browser and video font metrics can differ.

Implementation choice for this slice: **Whisper.cpp small runs on the Mac, with no paid API call. FFmpeg/libass burns the captions.** The OpenAI API and Remotion sections above remain researched alternatives, not claims about the current implementation. Automatic internal silence/filler cuts, automatic zoom and music are not built yet. This is a single-user local prototype; it is not a public upload service.

### Starting it on this Mac

The project is `/Users/sam/build-sprint-app`.

1. Keep the existing `npm run dev` session running for React and local Convex. Do not start a second Convex backend on the same port.
2. Run `npm run setup:reels` once to configure the local worker's private access key.
3. In another terminal run `npm run dev:reels`.
4. Open `http://localhost:5173/reels` and upload a recording.

Installed locally during this build: Homebrew `whisper-cpp` and `ffmpeg-full`, a multilingual small model in `.reel-data/models/ggml-small.bin`, and the licensed Noto Sans Devanagari font. The worker defaults to Apple Silicon Homebrew paths; `REEL_FFMPEG`, `REEL_FFPROBE`, `REEL_WHISPER` and `REEL_MODEL` can override those paths. A second Mac needs those prerequisites. No API key is required for the implemented route.

`.reel-data/` is ignored by Git and holds local recordings, processing files, exports, the model and worker key. Edits/job status are in local Convex. Keep this directory with the local backend if moving the prototype; an editor link alone does not move the media. The worker listens on loopback only and checks request origins. Its private Convex key is not sent to the browser. Stale saves from another tab are rejected.

### Verification and limits

- `npm run check`, `npm test` (128 tests), and `npm run build` passed. Build retains a large-bundle warning.
- Browser-tested upload, correction, save/reload, custom font upload, Hindi text edits, export and file download. Opened at 1440px and 390px; no horizontal overflow on the phone layout.
- Tested with a **32.6-second synthetic English speech clip and test-pattern video**. First preparation took 26.8 seconds and export 15.2 seconds. A repeat preparation took 19.2 seconds; the Hindi-font export took 46.6 seconds. These are individual local measurements, not a speed promise.
- Found and fixed dropped zero-duration words from the recogniser. The fresh run retains all 90 recognised words, including the previously missing “a”. A regression test covers this.
- Downloaded output checked: H.264 video, AAC audio, 1080 × 1920, 32.6 seconds. Inspected rendered English and Hindi text frames. Hindi rendering was verified through manual text edits; Hindi/Hinglish speech recognition accuracy on real phone recordings has **not** been established.
- Draft preview uses browser text layout; final preview uses the rendered file. Review the exported video before publishing. Word timing is editable and recognition can require corrections.
- No public deployment or billing integration was performed. Next acceptance test: a founder's own phone recording, including background noise and brand names.

Evidence: `verification/reel-prototype-results.json`, `verification/reel-prototype-frame.png`, and `verification/reel-prototype-{check,tests,build}.txt`.

### Local implementation update — 8 October: backgrounds and covers
The local prototype now includes five original gradient backgrounds plus Original, using Apple's Vision person segmentation and FFmpeg compositing. No Pinterest images are bundled. Masks are cached locally, so changing the background does not repeat person segmentation. Preview the result through Export reel; draft playback still uses the original room. New-machine setup compiles `scripts/reel/person-mask.swift` via `npm run setup:reels`.

The cover tool suggests a transcript excerpt, supports a manually selected frame, editable headline and text colour, and uses the selected font/background. Download is a separate 1080x1920 PNG. This is a deterministic transcript suggestion, not a paid language-model call or an automatic best-face selector. Review hair edges and the chosen expression before sharing.

References for the local implementation: [Apple person segmentation](https://developer.apple.com/documentation/vision/vngeneratepersonsegmentationrequest), [quality levels](https://developer.apple.com/documentation/vision/vngeneratepersonsegmentationrequest/qualitylevel-swift.enum).
