import { test } from "node:test";
import assert from "node:assert/strict";
import {
  customerQuotes,
  sampleReels,
  sampleRevision,
  validateReels,
  sampleTranscript,
} from "../convex/content";
test("scripts require customer evidence and reject ungrounded claims", () => {
  const quotes = customerQuotes(sampleTranscript),
    reels = sampleReels(quotes);
  assert.equal(quotes.length, 6);
  assert.ok(!quotes.some((q) => q.includes("What changed")));
  assert.equal(validateReels(reels, quotes).length, 3);
  assert.throws(
    () =>
      validateReels(
        [
          { ...reels[0], caption: "We guarantee 10x growth." },
          ...reels.slice(1),
        ],
        quotes,
      ),
    /supporting customer quote/,
  );
  assert.throws(
    () => customerQuotes("Founder: Buy this now."),
    /three customer/,
  );
});
test("feedback revises one script while retaining customer sources", () => {
  const quotes = customerQuotes(sampleTranscript),
    reels = sampleReels(quotes),
    original = structuredClone(reels);
  const revised = sampleRevision(reels[0], "Make it shorter", quotes);
  validateReels([revised], quotes, 1);
  assert.equal(revised.script.length, 1);
  assert.notDeepEqual(revised, reels[0]);
  assert.deepEqual(reels, original);
});

test("a writer cannot remove a customer’s negation", () => {
  const quotes = [
    "I did not save time.",
    "It was expensive.",
    "It was difficult.",
  ];
  const reels = sampleReels(quotes);
  assert.throws(
    () =>
      validateReels(
        [{ ...reels[0], caption: "save time." }, ...reels.slice(1)],
        quotes,
      ),
    /outside/,
  );
});

test("recommendations develop pain, emotion and takeaway instead of copying two quotes", () => {
  const reels = sampleReels(customerQuotes(sampleTranscript));
  assert.deepEqual(
    reels.map((r) => r.insight?.angle),
    ["pain", "emotion", "takeaway"],
  );
  assert.match(reels[0].insight!.painPoint, /five spreadsheets/);
  assert.equal(reels[1].insight!.emotionBasis, "inferred");
  assert.match(reels[1].insight!.emotion, /Regret/);
  assert.ok(reels.every((r) => r.script.length >= 4));
  assert.ok(reels.every((r) => r.onScreen.every((t) => t.length < 65)));
});

import { requireSupported } from "../convex/story";
test("factual review must cover every line and reject changed meaning", () => {
  const items = [
    { id: "line", text: "I saved time.", evidence: ["I did not save time."] },
  ];
  assert.throws(
    () =>
      requireSupported(items, [
        { id: "line", supported: false, reason: "Reverses negation" },
      ]),
    /verify/,
  );
  assert.throws(() => requireSupported(items, []), /verify/);
  assert.throws(
    () =>
      requireSupported(items, [{ id: "other", supported: true, reason: "" }]),
    /verify/,
  );
  assert.doesNotThrow(() =>
    requireSupported(
      [{ ...items[0], text: "I did not save time." }],
      [{ id: "line", supported: true, reason: "" }],
    ),
  );
});
