# Standalone recommendation engine and reviewed reference loop

## What exists now
A provider-independent TypeScript playbook in `convex/businessRecommendations.ts`: categories, creative patterns, evidence requirements and fallbacks. The generator uses category guidance in planning, drafting and review. It is rules plus the existing connected writer; it is not a fine-tuned language or vision model. No local model installation, new subscription or training job was started.

## Repository collection method
1. Collect original brand/creator material with permission, your own campaigns, or assets with explicit applicable reuse/training rights. Pinterest/Canva can be discovery interfaces only within their terms; a public screenshot or API response does not establish training rights. Record the original source and permission. Do not make automated scraping the ingestion plan.
2. Preserve a complete carousel, not just its hook. Record the industry, product, reader, objective, awareness hypothesis, format, slide purposes, copy, image role, brand style, proof requirements, source URL/date, rights and why it works. Keep opinion separate from actual performance.
3. Remove duplicates by file hash and visual/creative similarity. Redact private chat data. Store third-party material only under the permitted purpose. Unknown rights means quarantine from training and output asset reuse; describe general patterns in original words.
4. Human-review each entry: accept, reject or uncertain. Record failure reason (generic hook, crowding, weak product visibility, wrong assets, unsupported proof, inaccessible type, incoherent sequence). Keep rejected examples to teach evaluation, if collection rights permit.
5. Retrieve by category + goal + evidence + visual assets. Provide a small relevant set of accepted pattern descriptions to the writer. Never copy another brand's copy, assets or claims.
6. Save user-approved output and allowed before/after edits with permission. A click/download is not proof of marketing effectiveness. Promote a pattern only after held-out evaluation; do not silently rewrite the policy from every upload.

## Record structure
Use JSONL records with: id, original_source_url, captured_at, creator, category, format, reader, objective, awareness_basis, slide_purposes, pattern, image_role, evidence_required, missing_evidence_fallback, rights_status, rights_document, permitted_uses, reviewer, verdict, rationale, performance_metric, performance_denominator, performance_window, consent, file_hash. Null metrics remain null, never zero or invented. Full source text or pixels require appropriate rights; a descriptive tag is not a licence.

## Separating evaluation from learning
Keep brands/creators and near-duplicate campaigns out of both training and test sets. Reserve unseen brands across all priority categories. Assess truthfulness, brand colours/type/assets, product visibility, copy relevance, progression, legibility, fit of format and verified export. Compare against baseline blind to version; retain human pairwise preferences and reasons. Set the acceptance threshold before testing. Engagement needs impressions, audience, placement and time window; likes alone are not comparable evidence.

## Actual model training later
Only if retrieval/rules plateau and there is a clear recurring failure: build rights-cleared input brief → human-approved recommendation pairs and preferred/rejected outputs. Start with a small experiment on category/pattern recommendation rather than promising a complete trained design generator. Decide separate copy, layout and rendering responsibilities. A model cannot fix missing assets or a bad renderer. Compute costs, provider licence and expected laptop demands must be reviewed before starting; this phase starts no training. Dataset size follows diversity and measured learning curves, not a promised magic example count.

## Current platform constraints, checked 6 October 2026
Pinterest developer guidelines prohibit unpermitted automated extraction and using Pinterest Materials to train/develop/improve AI models; also restrict storage of information accessed through their materials, including API. API access is not a bulk dataset licence: https://policy.pinterest.com/en/developer-guidelines
Canva terms restrict data mining/extraction/scraping; their MCP documentation also prohibits bulk extraction, competitive-product use and AI/ML training from accessible resources: https://www.canva.com/policies/terms-of-use/ and https://www.canva.dev/docs/apps/mcp/prohibited-use/
Seek explicit permission where required and use directly licensed creator/original-brand material for a training repository. No scraping/integration is implemented here.
