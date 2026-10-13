import { ConvexError, v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const OPENAI_CALLS_PER_HOUR = 50;
export const OPENAI_CALL_WINDOW_MS = 60 * 60 * 1000;

export function reserveOpenAICall(timestamps: number[], now: number) {
  const active = timestamps.filter((timestamp) => timestamp > now - OPENAI_CALL_WINDOW_MS);
  if (active.length >= OPENAI_CALLS_PER_HOUR)
    throw new Error("AI call limit reached. Try again later.");
  return [...active, now];
}

export const reserveCall = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const now = Date.now();
    const window = await ctx.db
      .query("openaiCallWindows")
      .withIndex("by_scope", (q) => q.eq("scope", "app"))
      .unique();
    let timestamps: number[];
    try {
      timestamps = reserveOpenAICall(window?.timestamps ?? [], now);
    } catch (error) {
      throw new ConvexError(error instanceof Error ? error.message : "AI call limit reached. Try again later.");
    }
    if (window) await ctx.db.patch(window._id, { timestamps });
    else await ctx.db.insert("openaiCallWindows", { scope: "app", timestamps });
    return null;
  },
});
