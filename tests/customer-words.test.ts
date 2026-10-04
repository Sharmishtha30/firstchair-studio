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
  const reels = [0, 1, 2].map((i) => ({
    title: "A customer statement",
    script: [quotes[i]],
    onScreen: [quotes[i]],
    caption: quotes[i],
    sources: [quotes[i]],
  }));
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

test("greetings and acknowledgements are never recommended as content", () => {
  const quotes = customerQuotes(
    "Customer: Hi!\nCustomer: Good morning.\nCustomer: Thanks!\nCustomer: Every Friday I waste hours finding reports.\nCustomer: I feel embarrassed when I cannot answer in meetings.\nCustomer: I wish the updates were in one place.",
  );
  assert.equal(quotes.length, 3);
  assert.ok(
    quotes.every((q) => !["Hi!", "Good morning.", "Thanks!"].includes(q)),
  );
  assert.throws(() => sampleReels(quotes), /Sample mode cannot analyze/);
});
test("customer statements on continuation lines are retained", () => {
  const quotes = customerQuotes(
    "Founder: Tell me what is hard.\nCustomer: Hello!\nI spend Friday chasing reports.\nI feel anxious before meetings.\nI wish I had one page.\nFounder: We guarantee success.",
  );
  assert.deepEqual(quotes, [
    "I spend Friday chasing reports.",
    "I feel anxious before meetings.",
    "I wish I had one page.",
  ]);
});

import { validateInsights } from "../convex/story";
test("an insight cannot use a greeting or an invented evidence quote", () => {
  const base = {
    angle: "pain" as const,
    painPoint: "Scattered reporting",
    emotion: "Not stated",
    emotionBasis: "not_present" as const,
    story: "Reporting arrives after the meeting.",
    evidence: ["Hello!"],
  };
  assert.throws(() => validateInsights([base], ["Hello!"], 1), /substantive/);
  assert.throws(
    () =>
      validateInsights(
        [{ ...base, evidence: ["Invented statement."] }],
        ["I miss meetings while finding reports."],
        1,
      ),
    /substantive/,
  );
  assert.doesNotThrow(() =>
    validateInsights(
      [{ ...base, evidence: ["I miss meetings while finding reports."] }],
      ["I miss meetings while finding reports."],
      1,
    ),
  );
});

import { writerErrorMessage } from "../convex/writerErrors";
test("missing API credits are reported as billing, not a disconnected key", () => {
  assert.match(
    writerErrorMessage(
      "Failed after 2 attempts. You have no credits remaining.",
    ),
    /API credit or quota/,
  );
  assert.doesNotMatch(
    writerErrorMessage("You have no credits remaining."),
    /Replace OPENAI_API_KEY/,
  );
  assert.match(
    writerErrorMessage("Incorrect API key provided."),
    /did not accept/,
  );
});
