import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import {
  customerQuotes,
  sampleTranscript,
  validateReels,
  isConversationFiller,
} from "../convex/content";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const client = new ConvexHttpClient("http://127.0.0.1:3210");
assert.equal(await client.action(api.writer.status, {}), "ai");
const transcript =
  "Customer: Hello!\nCustomer: Good morning.\n" + sampleTranscript;
const result = await client.action(api.writer.generate, {
  transcript,
  brand:
    "Calm and direct. Short sentences, no hype. Center the pain and the human feeling, not a product pitch.",
});
assert.equal(result.mode, "ai");
validateReels(result.reels, customerQuotes(transcript));
assert.deepEqual([...result.reels.map((r) => r.insight?.angle)].sort(), [
  "emotion",
  "pain",
  "takeaway",
]);
assert.ok(
  result.reels.every((r) => r.sources.every((q) => !isConversationFiller(q))),
);
console.log(
  "AI generation output:\n" +
    JSON.stringify({ mode: result.mode, reels: result.reels }, null, 2),
);
const index = result.reels.findIndex((r) => r.insight?.angle === "pain");
const revised = await client.action(api.writer.revise, {
  token: result.token,
  index,
  feedback:
    "Make the hook focus on finding the right numbers after the meeting is already over. Keep the story short and grounded.",
});
validateReels([revised], customerQuotes(transcript), 1);
const stored = JSON.parse(
  execFileSync(
    "npx",
    ["convex", "run", "runs:get", JSON.stringify({ token: result.token })],
    { encoding: "utf8" },
  ),
);
assert.deepEqual(stored.reels[index], revised);
for (let i = 0; i < 3; i++)
  if (i !== index) assert.deepEqual(stored.reels[i], result.reels[i]);
console.log("\nRevised pain script:\n" + JSON.stringify(revised, null, 2));
console.log(
  "\nPASS: The active backend detects the key and real AI generated three substantive story angles, excluding greetings.",
);
console.log("PASS: AI feedback revised and saved only the selected script.");
