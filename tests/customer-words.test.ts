import { test } from "node:test";
import assert from "node:assert/strict";
import {
  customerQuotes,
  sampleReels,
  sampleRevision,
  validateReels,
  sampleTranscript,
} from "../convex/content";
test("scripts use customer words and reject invented claims", () => {
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
    /outside/,
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
