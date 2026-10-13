import type { ActionCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { credentialsFor, credentialsForUser } from "./chatgpt";
import { planModel } from "./chatgptModel";
import { openAIModel } from "./openaiModel";

export function selectedAIProvider(setting = process.env.AI_PROVIDER) {
  return setting === "chatgpt" ? "chatgpt" : "openai";
}

export async function textModel(ctx: ActionCtx, userId?: Id<"users">) {
  if (selectedAIProvider() === "chatgpt") {
    const credentials = userId
      ? await credentialsForUser(ctx, userId)
      : await credentialsFor(ctx);
    return {
      model: planModel(credentials, ctx),
      provider: "ChatGPT sign-in",
      modelName: credentials.model,
      usageNote: "Writing uses your connected ChatGPT plan.",
    };
  }
  return {
    model: openAIModel(ctx),
    provider: "OpenAI API",
    modelName: process.env.OPENAI_MODEL || "gpt-5-mini",
    usageNote: "Writing uses the shared FirstChair OpenAI key.",
  };
}
