import { createOpenAI } from "@ai-sdk/openai";
import { ConvexError } from "convex/values";
import type { ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";

export const OPENAI_REPLY_TOKEN_CAP = 1500;
const responseEndpoint = "https://api.openai.com/v1/responses";

export function requireOpenAIKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new ConvexError("AI key not set");
  return apiKey;
}

export function openAIModel(ctx: ActionCtx) {
  const apiKey = requireOpenAIKey();

  const openai = createOpenAI({
    apiKey,
    fetch: async (input, init) => {
      if (String(input) !== responseEndpoint)
        throw new Error("Unsupported OpenAI endpoint.");
      const rawBody = init?.body;
      if (typeof rawBody !== "string")
        throw new Error("OpenAI request could not be prepared.");
      let body: Record<string, unknown>;
      try {
        body = JSON.parse(rawBody);
      } catch {
        throw new Error("OpenAI request could not be prepared.");
      }
      const requested = body.max_output_tokens;
      body.max_output_tokens =
        typeof requested === "number"
          ? Math.min(requested, OPENAI_REPLY_TOKEN_CAP)
          : OPENAI_REPLY_TOKEN_CAP;
      await ctx.runMutation(internal.openaiLimits.reserveCall, {});
      return fetch(input, {
        ...init,
        body: JSON.stringify(body),
        signal: init?.signal ?? AbortSignal.timeout(120000),
      });
    },
  });
  return openai.responses(process.env.OPENAI_MODEL || "gpt-5-mini");
}
