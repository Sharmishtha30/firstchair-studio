import { test } from "node:test";
import assert from "node:assert/strict";
import { streamObject } from "ai";
import { z } from "zod";
import type { ActionCtx } from "../convex/_generated/server";
import { openAIModel, OPENAI_REPLY_TOKEN_CAP } from "../convex/openaiModel";
import {
  OPENAI_CALLS_PER_HOUR,
  OPENAI_CALL_WINDOW_MS,
  reserveOpenAICall,
} from "../convex/openaiLimits";

test("the app-wide call allowance is a rolling 50-call hour", () => {
  const now = 2_000_000;
  let calls = Array.from(
    { length: OPENAI_CALLS_PER_HOUR - 1 },
    (_, index) => now - index * 100,
  );
  calls = reserveOpenAICall(calls, now);
  assert.equal(calls.length, 50);
  assert.throws(() => reserveOpenAICall(calls, now + 1), /AI call limit reached/);
  assert.equal(
    reserveOpenAICall([now - OPENAI_CALL_WINDOW_MS], now).length,
    1,
  );
});

test("OpenAI API-key absence fails with the on-screen message", () => {
  const previous = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    assert.throws(
      () => openAIModel({} as ActionCtx),
      (error: unknown) =>
        error instanceof Error && error.message === "AI key not set",
    );
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous;
  }
});

test("all OpenAI replies are clamped to 1500 tokens and count toward one shared limit", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = globalThis.fetch;
  process.env.OPENAI_API_KEY = "fixture-only-not-a-real-key";
  process.env.OPENAI_MODEL = "gpt-5-mini";
  let requestBody: Record<string, unknown> | undefined;
  let reservations = 0;
  globalThis.fetch = async (input, init) => {
    assert.equal(String(input), "https://api.openai.com/v1/responses");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("authorization"), "Bearer fixture-only-not-a-real-key");
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
    const output = streamObject({
      model: openAIModel(ctx),
      schema: z.object({ result: z.string() }),
      prompt: "Return a short result.",
      maxOutputTokens: 3000,
      maxRetries: 0,
    });
    await assert.rejects(output.object);
    assert.equal(requestBody?.model, "gpt-5-mini");
    assert.equal(requestBody?.max_output_tokens, OPENAI_REPLY_TOKEN_CAP);
    assert.equal(reservations, 1);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
  }
});
