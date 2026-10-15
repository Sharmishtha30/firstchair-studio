# Local example rerun — 13 October 2026

Both examples used invented source content and foundersfind.club for styling. Thirty API calls were available before the run. No production changes.

- Transcript: failed after approximately 71 seconds, during correction of the draft. The response hit the configured size limit. First draft had three slides. Not accepted as ready; saving remained unavailable.
- Article: failed after approximately 65 seconds. Review reported missing permission-before-recording guidance. Manual inspection also found slides three and four repeating slides one and two, and an unfinished static sentence ending “whether they,”. Not accepted as ready.
- Browser previews showed the pink brand accents and foundersfind.club footer on both covers. Screenshots are saved beside this file. These are failed drafts, not approved samples.
- No finished export was claimed or tested because neither run reached Ready.
- Local AI_PROVIDER was restored to chatgpt and confirmed. No limits were raised. No deployment or Git push.

Next repair must keep correction responses bounded, ensure each batch writes its assigned part of the script, and enforce complete standalone static copy without deleting qualifications.

## Follow-up implementation (still awaiting final live verification)

- Replaced conflicting batch-wide instructions with one numbered slide task per request.
- Review corrections target explicit slide numbers, preserving unaffected content.
- Confirmed the response cap includes model reasoning; focused GPT-5 mini requests now use its documented minimal setting, while planning stays low.
- Removed word-array serialization after it encouraged artificial dot/hyphen joining. Ordinary text remains subject to the shared word budgets, duplicate detection and malformed-spacing checks.
- 191 offline tests plus type checks and renderer checks pass on this final revision.
- Final fresh API tests blocked by the hourly call allowance. Nothing deployed; local provider confirmed as chatgpt.

## Latest authorised local retry

- Temporary allowance: 75 calls, approved by the user; normal limit restored to 50 afterwards. Local provider restored to chatgpt.
- Transcript and article each failed after about 35 seconds on oversized frames. The repair previously addressed only the first oversized frame, leaving later frames to exhaust the single formatting correction pass.
- Changed the repair to collect all oversized frames together. Targets are 25 words for carousel and 15 for static, beneath the unchanged acceptance ceilings of 40 and 25. Preserve qualifications and complete thoughts.
- Follow-up transcript (about 35 seconds) and article (about 20 seconds) were blocked by the 75-call allowance. Neither verifies the latest repair end to end.
- No additional API calls, production deployment or Git push. Fresh article AND transcript output, editing and export still required before release.

## Production incident inspected, 13 October, approximately 21:10 IST

Production stage history confirms three attempts on the same article, each running planning, whole-pack formatting, and correction: nine writing requests total. Latest writer run: OpenAI API, gpt-5-mini, three requests, 27,639 ms. All three failed the carousel word-budget check; latest message names slide 2. Production's call window contains those nine calls, so this incident is not the hourly call-limit failure. Website styling happens separately and is excluded from writer duration.

The deployed writer is the older whole-pack implementation. Its single correction receives only the first validation error, rewrites the entire pack, then stops if any frame still exceeds its budget. Manual retry starts planning again; it is not a targeted slide retry. Exact word counts are unavailable because this failure occurs before draft persistence. Token totals and per-request response bodies were not recorded, so monetary cost cannot be calculated from these records.

The local fix targets individual slides and collects all oversized frames in one pass. Added regression tests cover multiple failing frames, unchanged valid frames, combined visible fields, and inclusive 40/25-word boundaries. Full local quality check passed: 193 tests, type checks, 24 rendered fixtures, 47 historical images decoded. These checks do not establish fresh model quality.

User chose to wait for the existing call allowance to reset rather than raise it. No new generation calls or deployment made during this incident investigation. Fresh article/transcript runs and exported-output inspection remain required before release.
