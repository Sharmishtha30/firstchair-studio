import { test } from "node:test";
import assert from "node:assert/strict";
import { streamObject } from "ai";
import { z } from "zod";
import type { ActionCtx } from "../convex/_generated/server";
import type { Credentials } from "../convex/chatgptSecurity";
import { planModel } from "../convex/chatgptModel";
import { OPENAI_CALLS_PER_HOUR } from "../convex/openaiLimits";
import { selectedAIProvider } from "../convex/textModel";

test("AI_PROVIDER selects ChatGPT only for the exact chatgpt setting", () => {
  assert.equal(selectedAIProvider("chatgpt"), "chatgpt");
  assert.equal(selectedAIProvider(undefined), "openai");
  assert.equal(selectedAIProvider("anything-else"), "openai");
});

test("ChatGPT replies use the shared 1500-token and hourly call limits", async () => {
  const previousFetch = globalThis.fetch;
  let requestBody: Record<string, unknown> | undefined;
  let reservations = 0;
  globalThis.fetch = async (_input, init) => {
    requestBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ error: { message: "fixture stop" } }), {
      status: 429,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const ctx = {
      runMutation: async () => {
        reservations++;
        return null;
      },
    } as unknown as ActionCtx;
    const model = planModel(
      { access_token: "fixture-only-not-a-real-token", model: "gpt-4.1" } as Credentials,
      ctx,
    );
    const result = streamObject({
      model,
      schema: z.object({ result: z.string() }),
      prompt: "Return a short result.",
      maxOutputTokens: OPENAI_CALLS_PER_HOUR * 60,
      maxRetries: 0,
    });
    await assert.rejects(result.object);
    assert.equal(requestBody?.max_output_tokens, 1500);
    assert.equal(reservations, 1);
  } finally {
    globalThis.fetch = previousFetch;
  }
});
