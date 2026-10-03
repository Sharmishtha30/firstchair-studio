import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import {
  sampleTranscript,
  customerQuotes,
  validateReels,
} from "../convex/content";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const client = new ConvexHttpClient("http://127.0.0.1:3210");
const brand = "Calm, direct, practical. Short sentences. No hype.";
console.log(
  "Sample transcript:\n" + sampleTranscript + "\n\nBrand note:\n" + brand,
);
assert.equal(await client.action(api.writer.status, {}), "sample");
const generated = await client.action(api.writer.generate, {
  transcript: sampleTranscript,
  brand,
});
assert.equal(generated.mode, "sample");
assert.equal(generated.reels.length, 3);
validateReels(generated.reels, customerQuotes(sampleTranscript));
console.log(
  "\nGenerated output (sample mode):\n" +
    JSON.stringify({ mode: generated.mode, reels: generated.reels }, null, 2),
);
const revised = await client.action(api.writer.revise, {
  token: generated.token,
  index: 0,
  feedback: "Make it shorter",
});
assert.equal(revised.script.length, 1);
validateReels([revised], customerQuotes(sampleTranscript), 1);
console.log(
  "\nFeedback on script 1: Make it shorter\nRevised output:\n" +
    JSON.stringify(revised, null, 2),
);
const stored = JSON.parse(
  execFileSync(
    "npx",
    ["convex", "run", "runs:get", JSON.stringify({ token: generated.token })],
    { encoding: "utf8" },
  ),
);
assert.deepEqual(stored.reels[0], revised);
assert.deepEqual(stored.reels.slice(1), generated.reels.slice(1));
console.log("\nPASS: Three scripts generated through local Convex.");
console.log(
  "PASS: Script 1 revised and saved; scripts 2 and 3 are unchanged in the database.",
);
await assert.rejects(
  client.action(api.writer.revise, {
    token: "unknown-session",
    index: 0,
    feedback: "Shorter please",
  }),
);
console.log("PASS: An unknown session cannot revise another run.");
await assert.rejects(
  client.action(api.writer.generate, {
    transcript:
      "Founder: We guarantee 10x growth.\nFounder: Buy now.\nFounder: No customer spoke.",
    brand,
  }),
);
console.log("PASS: A transcript without customer statements is rejected.");
console.log(
  "PASS: Every script line, on-screen line and caption is backed by customer words.",
);
