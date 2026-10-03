import { v } from "convex/values";
export const reelV = v.object({
  title: v.string(),
  insight: v.optional(
    v.object({
      angle: v.union(
        v.literal("pain"),
        v.literal("emotion"),
        v.literal("takeaway"),
      ),
      painPoint: v.string(),
      emotion: v.string(),
      emotionBasis: v.union(
        v.literal("stated"),
        v.literal("inferred"),
        v.literal("not_present"),
      ),
      story: v.string(),
      evidence: v.array(v.string()),
    }),
  ),
  grounding: v.optional(
    v.array(v.object({ text: v.string(), sources: v.array(v.string()) })),
  ),
  script: v.array(v.string()),
  onScreen: v.array(v.string()),
  caption: v.string(),
  sources: v.array(v.string()),
});
export const modeV = v.union(v.literal("sample"), v.literal("ai"));
